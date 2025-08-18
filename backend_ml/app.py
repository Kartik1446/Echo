from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect, Form
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
from datetime import datetime, date
import re

# Optional: time-based scheduler
try:
    from apscheduler.schedulers.background import BackgroundScheduler
    APSCHED_AVAILABLE = True
except Exception:
    APSCHED_AVAILABLE = False

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
    def _init_(self):
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
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                dead.append(connection)
        for d in dead:
            if d in self.active_connections:
                self.active_connections.remove(d)

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
    return

# Ensure model files at startup (best effort)
ensure_face_detector_files()

# -------------------- User Preferences & Roles --------------------

PREFS_FILE = "user_prefs.json"
ROLES_FILE = "face_roles.json"

USER_PREFS = {
    "username": "mate",
    "sleep_hour": 22,          # 24h format
    "sleep_enabled": True,
    "time_zone_note": "Uses server local time"
}

_last_sleep_nudge_date: Optional[date] = None  # to avoid repeating every minute

def load_prefs():
    global USER_PREFS
    if os.path.exists(PREFS_FILE):
        try:
            with open(PREFS_FILE, "r", encoding="utf-8") as f:
                USER_PREFS.update(json.load(f))
        except Exception as e:
            logging.warning(f"Failed to load {PREFS_FILE}: {e}")

def save_prefs():
    try:
        with open(PREFS_FILE, "w", encoding="utf-8") as f:
            json.dump(USER_PREFS, f, indent=2)
    except Exception as e:
        logging.warning(f"Failed to save {PREFS_FILE}: {e}")

def load_roles() -> dict:
    if os.path.exists(ROLES_FILE):
        try:
            with open(ROLES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logging.warning(f"Failed to load {ROLES_FILE}: {e}")
    return {}

def save_roles(data: dict):
    try:
        with open(ROLES_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logging.warning(f"Failed to save {ROLES_FILE}: {e}")

def get_label_role(label: str) -> str:
    roles = load_roles()
    return roles.get(label, "friend")  # default relation

def set_label_role(label: str, role: str):
    roles = load_roles()
    roles[label] = role
    save_roles(roles)

# Load prefs on startup
load_prefs()

# -------------------- Scheduler for Time-based Nudges --------------------

scheduler: Optional["BackgroundScheduler"] = None

def sleep_reminder_job():
    """Checks current time and speaks a reminder at configured sleep hour (runs every minute)."""
    global _last_sleep_nudge_date
    try:
        if not USER_PREFS.get("sleep_enabled", True):
            return

        now = datetime.now()
        if now.hour == int(USER_PREFS.get("sleep_hour", 22)):
            # send once per day
            if _last_sleep_nudge_date != now.date():
                username = USER_PREFS.get("username", "mate")
                msg = f"Hey {username}, it’s time to sleep."
                try:
                    speak(msg)
                except Exception as e:
                    logging.warning(f"Speak failed in scheduler: {e}")
                # Broadcast to WS listeners as well
                payload = json.dumps({
                    "type": "nudge",
                    "title": "Sleep Reminder",
                    "message": msg,
                    "timestamp": now.isoformat()
                })
                try:
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        asyncio.run_coroutine_threadsafe(manager.broadcast(payload), loop)
                except Exception:
                    # If no loop running (e.g., in tests), ignore
                    pass
                _last_sleep_nudge_date = now.date()
    except Exception as e:
        logging.warning(f"sleep_reminder_job error: {e}")

@app.on_event("startup")
def start_scheduler():
    global scheduler
    if APSCHED_AVAILABLE:
        try:
            scheduler = BackgroundScheduler() # type: ignore
            scheduler.add_job(sleep_reminder_job, 'interval', minutes=1, id="sleep_nudge")
            scheduler.start()
            logging.info("Background scheduler started (sleep reminder).")
        except Exception as e:
            logging.warning(f"Failed to start scheduler: {e}")
    else:
        logging.info("APScheduler not available. Skipping scheduler start.")

@app.on_event("shutdown")
def stop_scheduler():
    global scheduler
    if scheduler:
        try:
            scheduler.shutdown(wait=False)
        except Exception:
            pass

# -------------------- Pydantic models --------------------

class EmotionRequest(BaseModel):
    text: str

class FaceLabelRequest(BaseModel):
    label: str

class StreamingEmotionRequest(BaseModel):
    text: str
    user_id: Optional[str] = None

class PrefsRequest(BaseModel):
    username: Optional[str] = None
    sleep_hour: Optional[int] = None
    sleep_enabled: Optional[bool] = None

class FaceRoleRequest(BaseModel):
    label: str
    role: str

# -------------------- WebSocket Endpoints --------------------

@app.websocket("/ws/emotion")
async def websocket_emotion(websocket: WebSocket):
    """Real-time emotion detection via WebSocket"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            request = json.loads(data)
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
            data = await websocket.receive_text()
            request = json.loads(data)
            try:
                image_data = base64.b64decode(request.get("image", ""))
                image = Image.open(BytesIO(image_data))
                temp_path = f"temp_ws_{asyncio.get_event_loop().time()}.jpg"
                image.save(temp_path)
                label = recognize_face(temp_path)
                role = get_label_role(label) if label else None
                response = {
                    "type": "face_recognition_result",
                    "recognized": label if label else None,
                    "role": role,
                    "message": f"Recognized as {label} ({role})" if label else "Person not recognized",
                    "timestamp": asyncio.get_event_loop().time()
                }
                await manager.send_personal_message(json.dumps(response), websocket)
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
            data = await websocket.receive_text()
            request = json.loads(data)
            try:
                audio_data = base64.b64decode(request.get("audio", ""))
                temp_path = f"temp_audio_{asyncio.get_event_loop().time()}.wav"
                with open(temp_path, "wb") as f:
                    f.write(audio_data)
                text = audio_to_text(temp_path)
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

# -------------------- Voice Command Endpoint --------------------

@app.post("/voice-command")
async def voice_command(
    audio: UploadFile = File(...),
    image: Optional[UploadFile] = File(None),
    speak_response: Optional[bool] = True
):
    """
    Handles voice commands like:
      - "who is this"  -> requires an image file in the same request
      - "what time is it"
      - "what's my name"
    """
    tmp_dir = "temp_voice"
    os.makedirs(tmp_dir, exist_ok=True)
    audio_path = os.path.join(tmp_dir, audio.filename) # type: ignore

    try:
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        cmd_text = audio_to_text(audio_path).lower().strip()

        # Basic NLP by keyword matching
        if "who is this" in cmd_text or "who's this" in cmd_text or "who am i looking at" in cmd_text:
            if not image:
                msg = "I need an image to answer who this is."
                if speak_response:
                    try: speak(msg)
                    except Exception: pass
                return {"intent": "who_is_this", "need_image": True, "message": msg}

            # Save image and recognize
            img_path = os.path.join(tmp_dir, image.filename) # type: ignore
            with open(img_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

            label = recognize_face(img_path)
            role = get_label_role(label) if label else None

            if label:
                msg = f"This is {label}"
                if role:
                    msg += f", your {role}."
                else:
                    msg += "."
            else:
                msg = "Sorry, I do not recognize this person."

            if speak_response:
                try: speak(msg)
                except Exception as e: logging.warning(f"Speak failed: {e}")

            return {
                "intent": "who_is_this",
                "recognized": label if label else None,
                "role": role,
                "message": msg
            }

        if "what time is it" in cmd_text or "current time" in cmd_text or "tell me the time" in cmd_text:
            now_str = datetime.now().strftime("%I:%M %p")
            msg = f"It’s {now_str}."
            if speak_response:
                try: speak(msg)
                except Exception: pass
            return {"intent": "time_query", "message": msg, "time": now_str}

        if "what's my name" in cmd_text or "what is my name" in cmd_text:
            name = USER_PREFS.get("username", "mate")
            msg = f"Your name is {name}."
            if speak_response:
                try: speak(msg)
                except Exception: pass
            return {"intent": "name_query", "message": msg, "username": name}

        # Unknown command -> Try emotion on the text anyway
        emotion, confidence = detect_emotion(cmd_text)
        log_emotion(cmd_text, emotion, confidence)
        fallback_msg = f"I heard: '{cmd_text}'. Emotion: {emotion} ({confidence})."
        return {
            "intent": "unknown",
            "transcript": cmd_text,
            "emotion": emotion,
            "confidence": confidence,
            "message": fallback_msg
        }

    except Exception as e:
        logging.exception("Voice command failed")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        try:
            if os.path.exists(audio_path):
                os.remove(audio_path)
        except Exception:
            pass

# -------------------- Real-time Video Processing Endpoints --------------------

@app.post("/video-stream/emotion")
async def video_stream_emotion(file: UploadFile = File(...)):
    """Process video stream for real-time emotion detection (placeholder demo)."""
    try:
        tmp_dir = "temp_video"
        os.makedirs(tmp_dir, exist_ok=True)
        file_path = os.path.join(tmp_dir, file.filename) # type: ignore

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        cap = cv2.VideoCapture(file_path)
        emotions = []
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
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
        tmp_dir = "temp_video"
        os.makedirs(tmp_dir, exist_ok=True)
        file_path = os.path.join(tmp_dir, file.filename) # type: ignore

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        cap = cv2.VideoCapture(file_path)
        recognitions = []
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            if frame_count % 10 == 0:
                temp_frame_path = f"temp_frame_{frame_count}.jpg"
                cv2.imwrite(temp_frame_path, frame)
                try:
                    label = recognize_face(temp_frame_path)
                    if label:
                        recognitions.append({
                            "frame": frame_count,
                            "person": label,
                            "role": get_label_role(label),
                            "timestamp": frame_count / 30.0
                        })
                except:
                    pass
                if os.path.exists(temp_frame_path):
                    os.remove(temp_frame_path)
            frame_count += 1

        cap.release()
        if os.path.exists(file_path):
            os.remove(file_path)

        return {
            "recognitions": recognitions,
            "total_frames": frame_count,
            "unique_persons": list({r["person"] for r in recognitions})
        }
    except Exception as e:
        logging.exception("Video face recognition failed")
        raise HTTPException(status_code=500, detail=str(e))

# -------------------- Streaming Endpoints --------------------

@app.post("/stream-emotion")
async def stream_emotion(request: StreamingEmotionRequest):
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
    async def generate():
        while True:
            summary = get_emotion_summary()
            yield f"data: {json.dumps(summary)}\n\n"
            await asyncio.sleep(1)
    return StreamingResponse(generate(), media_type="text/plain")

# -------------------- Real-time Camera Endpoints --------------------

@app.get("/camera/start")
async def start_camera():
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            raise HTTPException(status_code=500, detail="Could not open camera")
        cap.release()
        return {"status": "camera_started", "message": "Camera is now active for real-time processing"}
    except Exception as e:
        logging.exception("Failed to start camera")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/camera/stop")
async def stop_camera():
    return {"status": "camera_stopped", "message": "Camera processing stopped"}

# -------------------- Universal Upload Endpoint --------------------

@app.post("/upload-universal")
async def upload_universal(file: UploadFile = File(...)):
    """
    Universal upload endpoint that automatically detects content type and processes accordingly.
    Supports: images (face recognition), audio (emotion detection), video (emotion/face analysis), text files
    """
    try:
        tmp_dir = "temp_universal"
        os.makedirs(tmp_dir, exist_ok=True)
        file_path = os.path.join(tmp_dir, file.filename) # type: ignore

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_extension = file.filename.lower().split('.')[-1] if '.' in file.filename else '' # type: ignore
        mime_type = file.content_type or ''

        image_extensions = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp']
        audio_extensions = ['wav', 'mp3', 'm4a', 'flac', 'ogg', 'aac']
        video_extensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm']
        text_extensions = ['txt', 'md', 'json', 'csv']

        # Image
        if file_extension in image_extensions or 'image' in mime_type:
            try:
                label = recognize_face(file_path)
                if label:
                    role = get_label_role(label)
                    return {
                        "content_type": "image",
                        "processing": "face_recognition",
                        "result": {
                            "recognized": label,
                            "role": role,
                            "message": f"Recognized as {label} ({role})"
                        },
                        "file_info": {
                            "filename": file.filename,
                            "size": os.path.getsize(file_path),
                            "mime_type": mime_type
                        }
                    }
                else:
                    return {
                        "content_type": "image",
                        "processing": "image_analysis",
                        "result": {
                            "message": "Image uploaded. No face recognized.",
                            "suggestion": "Use /upload-face/ with label (and /set-face-role to set relation)"
                        },
                        "file_info": {
                            "filename": file.filename,
                            "size": os.path.getsize(file_path),
                            "mime_type": mime_type
                        }
                    }
            except Exception:
                return {
                    "content_type": "image",
                    "processing": "image_analysis",
                    "result": {
                        "message": "Image uploaded",
                        "note": "Processing fallback"
                    },
                    "file_info": {
                        "filename": file.filename,
                        "size": os.path.getsize(file_path),
                        "mime_type": mime_type
                    }
                }

        # Audio
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
                        "message": "Audio uploaded",
                        "error": str(e)
                    },
                    "file_info": {
                        "filename": file.filename,
                        "size": os.path.getsize(file_path),
                        "mime_type": mime_type
                    }
                }

        # Video
        if file_extension in video_extensions or 'video' in mime_type:
            try:
                cap = cv2.VideoCapture(file_path)
                recognitions = []
                frame_count = 0
                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        break
                    if frame_count % 10 == 0:
                        temp_frame_path = f"temp_frame_{frame_count}.jpg"
                        cv2.imwrite(temp_frame_path, frame)
                        try:
                            label = recognize_face(temp_frame_path)
                            if label:
                                recognitions.append({
                                    "frame": frame_count,
                                    "person": label,
                                    "role": get_label_role(label),
                                    "timestamp": frame_count / 30.0
                                })
                        except:
                            pass
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
                        "unique_persons": list({r["person"] for r in recognitions}),
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
                        "message": "Video uploaded",
                        "error": str(e)
                    },
                    "file_info": {
                        "filename": file.filename,
                        "size": os.path.getsize(file_path),
                        "mime_type": mime_type
                    }
                }

        # Text
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
                        "message": "Text file uploaded",
                        "error": str(e)
                    },
                    "file_info": {
                        "filename": file.filename,
                        "size": os.path.getsize(file_path),
                        "mime_type": mime_type
                    }
                }

        return {
            "content_type": "unknown",
            "processing": "file_upload",
            "result": {
                "message": "File uploaded successfully",
                "note": f"Unknown file type: {file_extension}. Saved for manual processing."
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
        try:
            if 'file_path' in locals() and os.path.exists(file_path): # type: ignore
                os.remove(file_path) # type: ignore
        except Exception:
            pass

# -------------------- Simple Text Input Endpoint --------------------

@app.post("/analyze-text")
async def analyze_text(request: EmotionRequest):
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

# -------------------- Original Endpoints (compatibility) --------------------

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
async def upload_face(
    label: str = Form(...),
    role: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    """
    Upload a labeled face image and (optionally) a relation role (friend/family/colleague...).
    """
    os.makedirs("faces", exist_ok=True)
    file_path = os.path.join("faces", file.filename) # type: ignore

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        save_labelled_face(file_path, label)
        if role:
            set_label_role(label, role)

        logging.info(f"Saved labeled face: {label} -> {file_path} (role={role})")
        return {"status": "success", "label": label, "role": role}
    except ValueError as e:
        logging.warning(f"No face detected while uploading {file.filename}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.exception("Failed to save labeled face")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recognize-face/")
async def recognize_face_api(file: UploadFile = File(...), speak_response: Optional[bool] = True):
    tmp_dir = "temp"
    os.makedirs(tmp_dir, exist_ok=True)
    file_path = os.path.join(tmp_dir, file.filename) # type: ignore

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        label = recognize_face(file_path)
        if label:
            role = get_label_role(label)
            message = f"According to your label, this is {label} ({role})."
        else:
            message = "Sorry, I do not recognize this person."

        if speak_response:
            try:
                speak(message)
            except Exception as e:
                logging.warning(f"Speak failed: {e}")

        return {"recognized": label if label else None, "role": get_label_role(label) if label else None, "message": message}
    except Exception as e:
        logging.exception("Face recognition failed")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass

# -------------------- Preferences & Roles Management --------------------

@app.post("/set-prefs")
async def set_prefs(prefs: PrefsRequest):
    if prefs.username is not None:
        USER_PREFS["username"] = prefs.username
    if prefs.sleep_hour is not None:
        try:
            hour = int(prefs.sleep_hour)
            if 0 <= hour <= 23:
                USER_PREFS["sleep_hour"] = hour
        except Exception:
            pass
    if prefs.sleep_enabled is not None:
        USER_PREFS["sleep_enabled"] = bool(prefs.sleep_enabled)
    save_prefs()
    return {"status": "ok", "prefs": USER_PREFS}

@app.get("/get-prefs")
async def get_prefs():
    return {"prefs": USER_PREFS}

@app.post("/set-face-role")
async def set_face_role(req: FaceRoleRequest):
    set_label_role(req.label, req.role)
    return {"status": "ok", "label": req.label, "role": req.role}

@app.get("/get-face-role")
async def get_face_role(label: str):
    role = get_label_role(label)
    return {"label": label, "role": role}

# -------------------- Utility Endpoints --------------------

@app.get("/health")
async def healthcheck():
    return {"status": "ok"}

@app.get("/list-faces")
async def list_known_faces():
    enc_file = "face_encodings.pkl"
    if os.path.exists(enc_file):
        try:
            import pickle
            with open(enc_file, "rb") as f:
                data = pickle.load(f)
            labels = list(dict.fromkeys(data.get("labels", [])))
            # Attach roles
            roles_map = load_roles()
            labeled_with_roles = [{"label": l, "role": roles_map.get(l, "friend")} for l in labels]
            return {"count": len(labels), "faces": labeled_with_roles}
        except Exception:
            logging.exception("Failed to read encodings")
            raise HTTPException(status_code=500, detail="Failed to read encodings")
    return {"count": 0, "faces": []}

# -------------------- Run with Uvicorn --------------------
if __name__ == "_main_":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)