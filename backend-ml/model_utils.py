import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import os
import pickle
import cv2
from deepface import DeepFace

# ---------------- EMOTION DETECTION ---------------- #

# Load your CSV file with labeled emotion data
df = pd.read_csv("ml_data.csv")  # Ensure this file exists

# Create a pipeline: vectorizer + classifier
model = make_pipeline(
    TfidfVectorizer(),
    LogisticRegression()
)

# Train the model
model.fit(df["text"], df["emotion"])

def detect_emotion(text: str) -> tuple[str, float]:
    pred = model.predict([text])[0]
    prob = max(model.predict_proba([text])[0])  # highest probability
    return pred, round(prob, 2)  # e.g., ('anxious', 0.87)

# ---------------- FACE RECOGNITION ---------------- #

ENCODINGS_FILE = "face_encodings.pkl"

def load_encodings():
    """Load stored face embeddings"""
    if os.path.exists(ENCODINGS_FILE):
        with open(ENCODINGS_FILE, "rb") as f:
            return pickle.load(f)
    return {"embeddings": [], "labels": []}

def save_encodings(data):
    """Save face embeddings to file"""
    with open(ENCODINGS_FILE, "wb") as f:
        pickle.dump(data, f)

def save_labelled_face(image_path: str, label: str):
    """
    Detects the face in the image, computes its embedding,
    and stores it with the provided label.
    """
    data = load_encodings()

    try:
        # Get embedding using DeepFace
        embedding_obj = DeepFace.represent(img_path=image_path, model_name="Facenet", enforce_detection=True)
        if not embedding_obj or "embedding" not in embedding_obj[0]:
            raise ValueError("No face detected in the image.")
        
        embedding = embedding_obj[0]["embedding"]
        data["embeddings"].append(embedding)
        data["labels"].append(label)
        save_encodings(data)
    except Exception as e:
        raise ValueError(f"Error processing image: {e}")

def recognize_face(image_path: str) -> str | None:
    """
    Recognize a face by comparing embeddings with stored data.
    Returns the label if matched, otherwise None.
    """
    data = load_encodings()
    if not data["embeddings"]:
        return None

    try:
        # Compute embedding for the given image
        embedding_obj = DeepFace.represent(img_path=image_path, model_name="Facenet", enforce_detection=True)
        if not embedding_obj or "embedding" not in embedding_obj[0]:
            return None
        
        embedding = embedding_obj[0]["embedding"]

        # Compare with stored embeddings using cosine similarity
        from numpy import dot
        from numpy.linalg import norm

        def cosine_similarity(a, b):
            return dot(a, b) / (norm(a) * norm(b))

        best_match = None
        best_score = 0.0

        for stored_embedding, label in zip(data["embeddings"], data["labels"]):
            score = cosine_similarity(embedding, stored_embedding)
            if score > best_score:
                best_score = score
                best_match = label

        # Threshold for match
        if best_score > 0.75:
            return best_match
        else:
            return None
    except Exception:
        return None
