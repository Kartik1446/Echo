import os
import pickle
import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from deepface import DeepFace
from numpy import dot
from numpy.linalg import norm

# ---------------- EMOTION DETECTION ---------------- #

# Load dataset
ML_DATA_FILE = "ml_data.csv"
if not os.path.exists(ML_DATA_FILE):
    raise FileNotFoundError(f"{ML_DATA_FILE} not found. Please provide the emotion dataset.")

df = pd.read_csv(ML_DATA_FILE)

# Create and train pipeline
model = make_pipeline(
    TfidfVectorizer(),
    LogisticRegression()
)
model.fit(df["text"], df["emotion"])

def detect_emotion(text: str) -> tuple[str, float]:
    """Predict emotion from text input."""
    pred = model.predict([text])[0]
    prob = max(model.predict_proba([text])[0])
    return pred, round(prob, 2)


# ---------------- FACE RECOGNITION ---------------- #

ENCODINGS_FILE = "face_encodings.pkl"

def load_encodings():
    """Load stored face embeddings."""
    if os.path.exists(ENCODINGS_FILE):
        with open(ENCODINGS_FILE, "rb") as f:
            return pickle.load(f)
    return {"embeddings": [], "labels": []}

def save_encodings(data):
    """Save face embeddings to file."""
    with open(ENCODINGS_FILE, "wb") as f:
        pickle.dump(data, f)

def save_labelled_face(image_path: str, label: str):
    """
    Detect face, extract embedding using DeepFace, and save it with label.
    """
    data = load_encodings()

    try:
        embedding_obj = DeepFace.represent(
            img_path=image_path,
            model_name="Facenet",
            enforce_detection=True
        )

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
    Compare a given face with stored embeddings and return matched label.
    """
    data = load_encodings()
    if not data["embeddings"]:
        return None

    try:
        embedding_obj = DeepFace.represent(
            img_path=image_path,
            model_name="Facenet",
            enforce_detection=True
        )

        if not embedding_obj or "embedding" not in embedding_obj[0]:
            return None

        embedding = embedding_obj[0]["embedding"]

        def cosine_similarity(a, b):
            return dot(a, b) / (norm(a) * norm(b))

        best_match = None
        best_score = 0.0

        for stored_embedding, label in zip(data["embeddings"], data["labels"]):
            score = cosine_similarity(embedding, stored_embedding)
            if score > best_score:
                best_score = score
                best_match = label

        return best_match if best_score > 0.75 else None

    except Exception:
        return None
