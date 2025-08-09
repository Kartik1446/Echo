from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import urllib.request
import logging
from typing import Optional

# project utilities (you already have these modules)
from model_utils import detect_emotion, save_labelled_face, recognize_face  # type: ignore
from speech_utils import audio_to_text, speak  # type: ignore
from logger_utils import log_emotion, get_emotion_summary  # type: ignore

# configure simple logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app = FastAPI(title="Echo Backend - ML / Face / Speech")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Helper: ensure face-detector models --------------------

CAFFE_FILES = {
    "deploy.prototxt": "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/deploy.prototxt",
    "res10_300x300_ssd_iter_140000.caffemodel": "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"
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
                # don't raise here — face recognition fallback (deepface/opencv alternatives) may exist
    return

# Ensure model files at startup (non-blocking best effort)
ensure_face_detector_files()

# -------------------- Pydantic models --------------------

class EmotionRequest(BaseModel):
    text: str

class FaceLabelRequest(BaseModel):
    label: str

# -------------------- Emotion Routes --------------------

@app.post("/detect-emotion")
async def detect_emotion_api(req: EmotionRequest):
    try:
        emotion, confidence = detect_emotion(req.text)
    except Exception as e:
        logging.exception("Emotion detection failed")
        raise HTTPException(status_code=500, detail=str(e))

    log_emotion(req.text, emotion, confidence)

    response_map = {
        "anxious": "You sound anxious. It’s okay, you’re safe and not alone.",
        "frustrated": "You seem frustrated. Take your time, I’m here to help.",
        "calm": "That’s good to hear. Let me know if you need anything.",
        "exhausted": "You might need rest. You’re doing okay.",
        "disoriented": "It looks like you're unsure where you are. Let me remind you, you're at home and you're safe.",
        "neutral": "I’m with you. Everything is okay."
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