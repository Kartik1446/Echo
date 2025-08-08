from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from model_utils import (
    detect_emotion,
    save_labelled_face,
    recognize_face
)
from speech_utils import audio_to_text, speak
from logger_utils import log_emotion, get_emotion_summary

app = FastAPI()

# Allow all origins (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- MODELS -------------------- #
class EmotionRequest(BaseModel):
    text: str

class FaceLabelRequest(BaseModel):
    label: str

# -------------------- EMOTION ROUTES -------------------- #

@app.post("/detect-emotion")
async def detect_emotion_api(req: EmotionRequest):
    emotion, confidence = detect_emotion(req.text)
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
    file_path = "temp_audio.wav"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    text = audio_to_text(file_path)
    emotion, confidence = detect_emotion(text)
    log_emotion(text, emotion, confidence)

    return {
        "original_text": text,
        "emotion": emotion,
        "confidence": confidence
    }

@app.get("/emotion-stats")
async def emotion_stats():
    return get_emotion_summary()

# -------------------- FACE RECOGNITION ROUTES -------------------- #

@app.post("/upload-face/")
async def upload_face(label: str, file: UploadFile = File(...)):
    """Upload a face image with a label (name)"""
    os.makedirs("faces", exist_ok=True)
    file_path = f"faces/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        save_labelled_face(file_path, label)
        return {"status": "success", "label": label}
    except ValueError as e:
        return {"status": "error", "message": str(e)}

@app.post("/recognize-face/")
async def recognize_face_api(file: UploadFile = File(...), speak_response: bool = True):
    """Recognize a face from uploaded image"""
    os.makedirs("temp", exist_ok=True)
    file_path = f"temp/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    label = recognize_face(file_path)

    if label:
        message = f"According to your label, this is {label}."
    else:
        message = "Sorry, I do not recognize this person."

    if speak_response:
        speak(message)

    return {"recognized": label if label else None, "message": message}