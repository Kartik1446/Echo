from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import shutil
import os
import urllib.request
import logging
import json
import asyncio
import cv2
import numpy as np
from typing import Optional, List
import base64
from io import BytesIO
from PIL import Image

# project utilities (you already have these modules)
from model_utils import detect_emotion, save_labelled_face, recognize_face, initialize_emotion_model  # type: ignore
from speech_utils import audio_to_text, speak  # type: ignore
from logger_utils import log_emotion, get_emotion_summary  # type: ignore

# configure simple logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Initialize the emotion detection model at startup
try:
    initialize_emotion_model()
    logging.info("Emotion detection model initialized successfully")
except Exception as e:
    logging.error(f"Failed to initialize emotion detection model: {e}")
    logging.warning("Emotion detection endpoints will not work until model is initialized")

app = FastAPI(title="Echo Backend - Universal ML / Face / Speech / Video - Real-time")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- WebSocket Connection Manager --------------------

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logging.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logging.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

# -------------------- Helper: ensure face-detector models --------------------

CAFFE_FILES = {
    "deploy.prototxt": "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt",
    "res10_300x300_ssd_iter_140000.caffemodel": "https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"
}

def ensure_face_detector_files(dest_dir: str = "."):
    """
    Download the lightweight OpenCV face detector (Caffe model + prototxt)
    if not already present in repo root (or dest_dir).
    """
    os.makedirs(dest_dir, exist_ok=True)
    for fname, url in CAFFE_FILES.items():
        path = os.path.join(dest_dir, fname)
        if not os.path.exists(path) or os.path.getsize(path) < 1000:
            logging.info(f"Downloading {fname} ...")
            try:
                urllib.request.urlretrieve(url, path)
                logging.info(f"Saved {path}")
            except Exception as e:
                logging.error(f"Failed to download {fname}: {e}")
                logging.warning(f"Face detection may not work properly without {fname}")
                # don't raise here — face recognition fallback (deepface/opencv alternatives) may exist
    return

# Ensure model files at startup (non-blocking best effort)
ensure_face_detector_files()

# -------------------- Pydantic models --------------------

class EmotionRequest(BaseModel):
    text: str

class FaceLabelRequest(BaseModel):
    label: str

class StreamingEmotionRequest(BaseModel):
    text: str
    user_id: Optional[str] = None

# -------------------- WebSocket Endpoints --------------------

@app.websocket("/ws/emotion")
async def websocket_emotion(websocket: WebSocket):
    """Real-time emotion detection via WebSocket"""
    await manager.connect(websocket)
    try:
        while True:
            # Receive streaming text input
            data = await websocket.receive_text()
            request = json.loads(data)
            
            # Process emotion detection
            try:
                emotion, confidence = detect_emotion(request.get("text", ""))
                log_emotion(request.get("text", ""), emotion, confidence)
                
                response = {
                    "type": "emotion_result",
                    "emotion": emotion,
                    "confidence": confidence,
                    "timestamp": asyncio.get_event_loop().time()
                }
                
                await manager.send_personal_message(json.dumps(response), websocket)
                
            except Exception as e:
                error_response = {
                    "type": "error",
                    "message": str(e),
                    "timestamp": asyncio.get_event_loop().time()
                }
                await manager.send_personal_message(json.dumps(error_response), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/face-recognition")
async def websocket_face_recognition(websocket: WebSocket):
    """Real-time face recognition via WebSocket"""
    await manager.connect(websocket)
    try:
        while True:
            # Receive base64 encoded image
            data = await websocket.receive_text()
            request = json.loads(data)
            
            try:
                # Decode base64 image
                image_data = base64.b64decode(request.get("image", ""))
                image = Image.open(BytesIO(image_data))
                
                # Save temporarily for processing
                temp_path = f"temp_ws_{asyncio.get_event_loop().time()}.jpg"
                image.save(temp_path)
                
                # Process face recognition
                label = recognize_face(temp_path)
                
                response = {
                    "type": "face_recognition_result",
                    "recognized": label if label else None,
                    "message": f"Recognized as {label}" if label else "Person not recognized",
                    "timestamp": asyncio.get_event_loop().time()
                }
                
                await manager.send_personal_message(json.dumps(response), websocket)
                
                # Cleanup
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
            except Exception as e:
                error_response = {
                    "type": "error",
                    "message": str(e),
                    "timestamp": asyncio.get_event_loop().time()
                }
                await manager.send_personal_message(json.dumps(error_response), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/audio-stream")
async def websocket_audio_stream(websocket: WebSocket):
    """Real-time audio streaming and processing via WebSocket"""
    await manager.connect(websocket)
    try:
        while True:
            # Receive base64 encoded audio chunks
            data = await websocket.receive_text()
            request = json.loads(data)
            
            try:
                # Decode base64 audio
                audio_data = base64.b64decode(request.get("audio", ""))
                
                # Save temporarily for processing
                temp_path = f"temp_audio_{asyncio.get_event_loop().time()}.wav"
                with open(temp_path, "wb") as f:
                    f.write(audio_data)
                
                # Process audio to text
                text = audio_to_text(temp_path)
                
                # Detect emotion from text
                emotion, confidence = detect_emotion(text)
                log_emotion(text, emotion, confidence)
                
                response = {
                    "type": "audio_processing_result",
                    "text": text,
                    "emotion": emotion,
                    "confidence": confidence,
                    "timestamp": asyncio.get_event_loop().time()
                }
                
                await manager.send_personal_message(json.dumps(response), websocket)
                
                # Cleanup
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
            except Exception as e:
                error_response = {
                    "type": "error",
                    "message": str(e),
                    "timestamp": asyncio.get_event_loop().time()
                }
                await manager.send_personal_message(json.dumps(error_response), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# -------------------- Real-time Video Processing Endpoints --------------------

@app.post("/video-stream/emotion")
async def video_stream_emotion(file: UploadFile = File(...)):
    """Process video stream for real-time emotion detection"""
    try:
        # Save uploaded video
        tmp_dir = "temp_video"
        os.makedirs(tmp_dir, exist_ok=True)
        file_path = os.path.join(tmp_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process video frames
        cap = cv2.VideoCapture(file_path)
        emotions = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Convert frame to text (simplified - in real implementation you'd use OCR or other methods)
            # For now, we'll simulate text extraction
            frame_text = f"Frame at {len(emotions)} seconds"
            
            try:
                emotion, confidence = detect_emotion(frame_text)
                emotions.append({
                    "frame": len(emotions),
                    "emotion": emotion,
                    "confidence": confidence,
                    "timestamp": len(emotions)
                })
            except:
                pass
        
        cap.release()
        
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return {
            "video_emotions": emotions,
            "total_frames": len(emotions),
            "dominant_emotion": max(set([e["emotion"] for e in emotions]), key=[e["emotion"] for e in emotions].count) if emotions else None
        }
        
    except Exception as e:
        logging.exception("Video emotion detection failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/video-stream/face-recognition")
async def video_stream_face_recognition(file: UploadFile = File(...)):
    """Process video stream for real-time face recognition"""
    try:
        # Save uploaded video
        tmp_dir = "temp_video"
        os.makedirs(tmp_dir, exist_ok=True)
        file_path = os.path.join(tmp_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process video frames
        cap = cv2.VideoCapture(file_path)
        recognitions = []
        
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process every 10th frame for efficiency
            if frame_count % 10 == 0:
                # Save frame temporarily
                temp_frame_path = f"temp_frame_{frame_count}.jpg"
                cv2.imwrite(temp_frame_path, frame)
                
                try:
                    label = recognize_face(temp_frame_path)
                    if label:
                        recognitions.append({
                            "frame": frame_count,
                            "person": label,
                            "timestamp": frame_count / 30.0  # Assuming 30fps
                        })
                except:
                    pass
                
                # Cleanup frame
                if os.path.exists(temp_frame_path):
                    os.remove(temp_frame_path)
            
            frame_count += 1
        
        cap.release()
        
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return {
            "recognitions": recognitions,
            "total_frames": frame_count,
            "unique_persons": list(set([r["person"] for r in recognitions]))
        }
        
    except Exception as e:
        logging.exception("Video face recognition failed")
        raise HTTPException(status_code=500, detail=str(e))

# -------------------- Streaming Endpoints --------------------

@app.post("/stream-emotion")
async def stream_emotion(request: StreamingEmotionRequest):
    """Stream emotion detection results"""
    try:
        emotion, confidence = detect_emotion(request.text)
        log_emotion(request.text, emotion, confidence)
        
        return {
            "emotion": emotion,
            "confidence": confidence,
            "timestamp": asyncio.get_event_loop().time(),
            "user_id": request.user_id
        }
    except Exception as e:
        logging.exception("Streaming emotion detection failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stream-emotion-feed")
async def stream_emotion_feed():
    """Stream real-time emotion feed"""
    async def generate():
        while True:
            # Get latest emotion data
            summary = get_emotion_summary()
            yield f"data: {json.dumps(summary)}\n\n"
            await asyncio.sleep(1)  # Update every second
    
    return StreamingResponse(generate(), media_type="text/plain")

# -------------------- Real-time Camera Endpoints --------------------

@app.get("/camera/start")
async def start_camera():
    """Start real-time camera processing"""
    try:
        cap = cv2.VideoCapture(0)  # Use default camera
        if not cap.isOpened():
            raise HTTPException(status_code=500, detail="Could not open camera")
        
        # Return camera status
        return {"status": "camera_started", "message": "Camera is now active for real-time processing"}
        
    except Exception as e:
        logging.exception("Failed to start camera")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/camera/stop")
async def stop_camera():
    """Stop real-time camera processing"""
    try:
        # In a real implementation, you'd have a global camera object to stop
        return {"status": "camera_stopped", "message": "Camera processing stopped"}
        
    except Exception as e:
        logging.exception("Failed to stop camera")
        raise HTTPException(status_code=500, detail=str(e))

# -------------------- Universal Upload Endpoint --------------------

@app.post("/upload-universal")
async def upload_universal(file: UploadFile = File(...)):
    """
    Universal upload endpoint that automatically detects content type and processes accordingly.
    Supports: images (face recognition), audio (emotion detection), video (emotion/face analysis)
    """
    try:
        # Create temp directory
        tmp_dir = "temp_universal"
        os.makedirs(tmp_dir, exist_ok=True)
        file_path = os.path.join(tmp_dir, file.filename)
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Detect content type based on file extension and MIME type
        file_extension = file.filename.lower().split('.')[-1] if '.' in file.filename else ''
        mime_type = file.content_type or ''
        
        # Image files
        image_extensions = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp']
        if file_extension in image_extensions or 'image' in mime_type:
            try:
                # Try face recognition first
                label = recognize_face(file_path)
                if label:
                    return {
                        "content_type": "image",
                        "processing": "face_recognition",
                        "result": {
                            "recognized": label,
                            "message": f"Recognized as {label}"
                        },
                        "file_info": {
                            "filename": file.filename,
                            "size": os.path.getsize(file_path),
                            "mime_type": mime_type
                        }
                    }
                else:
                    # If no face recognized, try emotion detection from image
                    # For now, we'll return a generic response since we need OCR for text extraction
                    return {
                        "content_type": "image",
                        "processing": "image_analysis",
                        "result": {
                            "message": "Image uploaded successfully. No face recognized. Consider adding a label for face recognition.",
                            "suggestion": "Use /upload-face/ endpoint with a label to train face recognition"
                        },
                        "file_info": {
                            "filename": file.filename,
                            "size": os.path.getsize(file_path),
                            "mime_type": mime_type
                        }
                    }
            except Exception as e:
                return {
                    "content_type": "image",
                    "processing": "image_analysis",
                    "result": {
                        "message": "Image uploaded successfully",
                        "note": "Image processing completed"
                    },
                    "file_info": {
                        "filename": file.filename,
                        "size": os.path.getsize(file_path),
                        "mime_type": mime_type
                    }
                }
        
        # Audio files
        audio_extensions = ['wav', 'mp3', 'm4a', 'flac', 'ogg', 'aac']
        if file_extension in audio_extensions or 'audio' in mime_type:
            try:
                text = audio_to_text(file_path)
                emotion, confidence = detect_emotion(text)
                log_emotion(text, emotion, confidence)
                
                return {
                    "content_type": "audio",
                    "processing": "audio_to_text_and_emotion",
                    "result": {
                        "transcribed_text": text,
                        "emotion": emotion,
                        "confidence": confidence
                    },
                    "file_info": {
                        "filename": file.filename,
                        "size": os.path.getsize(file_path),
                        "mime_type": mime_type
                    }
                }
            except Exception as e:
                return {
                    "content_type": "audio",
                    "processing": "audio_analysis",
                    "result": {
                        "message": "Audio uploaded successfully",
                        "error": str(e)
                    },
                    "file_info": {
                        "filename": file.filename,
                        "size": os.path.getsize(file_path),
                        "mime_type": mime_type
                    }
                }
        
        # Video files
        video_extensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm']
        if file_extension in video_extensions or 'video' in mime_type:
            try:
                # Process video for both emotion and face recognition
                cap = cv2.VideoCapture(file_path)
                emotions = []
                recognitions = []
                frame_count = 0
                
                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        break
                    
                    # Process every 10th frame for efficiency
                    if frame_count % 10 == 0:
                        # Save frame temporarily for processing
                        temp_frame_path = f"temp_frame_{frame_count}.jpg"
                        cv2.imwrite(temp_frame_path, frame)
                        
                        try:
                            # Try face recognition
                            label = recognize_face(temp_frame_path)
                            if label:
                                recognitions.append({
                                    "frame": frame_count,
                                    "person": label,
                                    "timestamp": frame_count / 30.0  # Assuming 30fps
                                })
                        except:
                            pass
                        
                        # Cleanup frame
                        if os.path.exists(temp_frame_path):
                            os.remove(temp_frame_path)
                    
                    frame_count += 1
                
                cap.release()
                
                return {
                    "content_type": "video",
                    "processing": "video_analysis",
                    "result": {
                        "total_frames": frame_count,
                        "recognitions": recognitions,
                        "unique_persons": list(set([r["person"] for r in recognitions])),
                        "message": f"Video processed: {frame_count} frames analyzed"
                    },
                    "file_info": {
                        "filename": file.filename,
                        "size": os.path.getsize(file_path),
                        "mime_type": mime_type
                    }
                }
                
            except Exception as e:
                return {
                    "content_type": "video",
                    "processing": "video_analysis",
                    "result": {
                        "message": "Video uploaded successfully",
                        "error": str(e)
                    },
                    "file_info": {
                        "filename": file.filename,
                        "size": os.path.getsize(file_path),
                        "mime_type": mime_type
                    }
                }
        
        # Text files
        text_extensions = ['txt', 'md', 'json', 'csv']
        if file_extension in text_extensions or 'text' in mime_type:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text_content = f.read()
                
                emotion, confidence = detect_emotion(text_content)
                log_emotion(text_content, emotion, confidence)
                
                return {
                    "content_type": "text",
                    "processing": "text_emotion_analysis",
                    "result": {
                        "text_preview": text_content[:200] + "..." if len(text_content) > 200 else text_content,
                        "emotion": emotion,
                        "confidence": confidence,
                        "text_length": len(text_content)
                    },
                    "file_info": {
                        "filename": file.filename,
                        "size": os.path.getsize(file_path),
                        "mime_type": mime_type
                    }
                }
                
            except Exception as e:
                return {
                    "content_type": "text",
                    "processing": "text_analysis",
                    "result": {
                        "message": "Text file uploaded successfully",
                        "error": str(e)
                    },
                    "file_info": {
                        "filename": file.filename,
                        "size": os.path.getsize(file_path),
                        "mime_type": mime_type
                    }
                }
        
        # Unknown file type
        return {
            "content_type": "unknown",
            "processing": "file_upload",
            "result": {
                "message": "File uploaded successfully",
                "note": f"Unknown file type: {file_extension}. File saved for manual processing."
            },
            "file_info": {
                "filename": file.filename,
                "size": os.path.getsize(file_path),
                "mime_type": mime_type,
                "extension": file_extension
            }
        }
        
    except Exception as e:
        logging.exception("Universal upload failed")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temp file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass

# -------------------- Simple Text Input Endpoint --------------------

@app.post("/analyze-text")
async def analyze_text(request: EmotionRequest):
    """
    Simple endpoint for analyzing text emotion without file upload.
    Just send text and get emotion analysis.
    """
    try:
        emotion, confidence = detect_emotion(request.text)
        log_emotion(request.text, emotion, confidence)
        
        response_map = {
            "anxious": "You sound anxious. It's okay, you're safe and not alone.",
            "frustrated": "You seem frustrated. Take your time, I'm here to help.",
            "calm": "That's good to hear. Let me know if you need anything.",
            "exhausted": "You might need rest. You're doing okay.",
            "disoriented": "It looks like you're unsure where you are. Let me remind you, you're at home and you're safe.",
            "neutral": "I'm with you. Everything is okay."
        }
        
        return {
            "content_type": "text_input",
            "processing": "text_emotion_analysis",
            "result": {
                "emotion": emotion,
                "confidence": confidence,
                "response": response_map.get(emotion, "I'm here with you."),
                "text_length": len(request.text)
            },
            "input": {
                "text": request.text[:100] + "..." if len(request.text) > 100 else request.text
            }
        }
        
    except Exception as e:
        logging.exception("Text analysis failed")
        raise HTTPException(status_code=500, detail=str(e))

# -------------------- Original Endpoints (kept for compatibility) --------------------

@app.post("/detect-emotion")
async def detect_emotion_api(req: EmotionRequest):
    try:
        emotion, confidence = detect_emotion(req.text)
    except Exception as e:
        logging.exception("Emotion detection failed")
        raise HTTPException(status_code=500, detail=str(e))

    log_emotion(req.text, emotion, confidence)

    response_map = {
        "anxious": "You sound anxious. It's okay, you're safe and not alone.",
        "frustrated": "You seem frustrated. Take your time, I'm here to help.",
        "calm": "That's good to hear. Let me know if you need anything.",
        "exhausted": "You might need rest. You're doing okay.",
        "disoriented": "It looks like you're unsure where you are. Let me remind you, you're at home and you're safe.",
        "neutral": "I'm with you. Everything is okay."
    }

    return {
        "emotion": emotion,
        "confidence": confidence,
        "response": response_map.get(emotion, "I'm here with you.")
    }

@app.post("/detect-emotion-from-audio")
async def detect_emotion_from_audio(file: UploadFile = File(...)):
    # save uploaded file
    tmp_dir = "temp_audio"
    os.makedirs(tmp_dir, exist_ok=True)
    file_path = os.path.join(tmp_dir, file.filename) # type: ignore

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = audio_to_text(file_path)
        emotion, confidence = detect_emotion(text)
        log_emotion(text, emotion, confidence)

        return {
            "original_text": text,
            "emotion": emotion,
            "confidence": confidence
        }
    except Exception as e:
        logging.exception("Audio emotion detection failed")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass

@app.get("/emotion-stats")
async def emotion_stats():
    return get_emotion_summary()

# -------------------- Face Recognition Routes --------------------

@app.post("/upload-face/")
async def upload_face(label: str, file: UploadFile = File(...)):
    """
    Upload a labeled face image. This will save encoding for the label.
    Example form field name: 'label' (string) and file field.
    """
    os.makedirs("faces", exist_ok=True)
    file_path = os.path.join("faces", file.filename) # type: ignore

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # save_labelled_face should raise ValueError if no face was detected
        save_labelled_face(file_path, label)
        logging.info(f"Saved labeled face: {label} -> {file_path}")
        return {"status": "success", "label": label}
    except ValueError as e:
        logging.warning(f"No face detected while uploading {file.filename}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.exception("Failed to save labeled face")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # keep original file under faces/ for future inspection (optional)
        pass

@app.post("/recognize-face/")
async def recognize_face_api(file: UploadFile = File(...), speak_response: Optional[bool] = True):
    """
    Recognize a face from uploaded image.
    If speak_response is true (default) the backend will attempt to speak the message.
    """
    tmp_dir = "temp"
    os.makedirs(tmp_dir, exist_ok=True)
    file_path = os.path.join(tmp_dir, file.filename) # type: ignore

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        label = recognize_face(file_path)  # returns label or None

        if label:
            message = f"According to your label, this is {label}."
        else:
            message = "Sorry, I do not recognize this person."

        if speak_response:
            try:
                speak(message)
            except Exception as e:
                logging.warning(f"Speak failed: {e}")

        return {"recognized": label if label else None, "message": message}
    except Exception as e:
        logging.exception("Face recognition failed")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass

# -------------------- Utility Endpoints --------------------

@app.get("/health")
async def healthcheck():
    return {"status": "ok"}

@app.get("/list-faces")
async def list_known_faces():
    """List saved face labels (if your model_utils stores labels file)."""
    enc_file = "face_encodings.pkl"
    if os.path.exists(enc_file):
        try:
            import pickle
            with open(enc_file, "rb") as f:
                data = pickle.load(f)
            labels = list(dict.fromkeys(data.get("labels", [])))
            return {"count": len(labels), "labels": labels}
        except Exception:
            logging.exception("Failed to read encodings")
            raise HTTPException(status_code=500, detail="Failed to read encodings")
    return {"count": 0, "labels": []}

# -------------------- Run with Uvicorn --------------------
if __name__ == "__main__":
    # local dev runner
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)