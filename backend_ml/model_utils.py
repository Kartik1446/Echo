import os
import pickle
import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from deepface import DeepFace
from numpy import dot
from numpy.linalg import norm
from typing import Tuple, Optional

# ---------------- EMOTION DETECTION ---------------- #

# Global variables
ML_DATA_FILE = "ml_data.csv"
model = None
df = None

def initialize_emotion_model():
    """Initialize the emotion detection model."""
    global model, df
    
    if not os.path.exists(ML_DATA_FILE):
        raise FileNotFoundError(f"{ML_DATA_FILE} not found. Please provide the emotion dataset.")

    try:
        df = pd.read_csv(ML_DATA_FILE)
        
        # Create and train pipeline
        model = make_pipeline(
            TfidfVectorizer(),
            LogisticRegression()
        )
        model.fit(df["text"], df["emotion"])
        print("Emotion detection model initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing emotion model: {e}")
        raise

def detect_emotion(text: str) -> Tuple[str, float]:
    """Predict emotion from text input."""
    if model is None:
        raise RuntimeError("Emotion model not initialized. Call initialize_emotion_model() first.")
    
    try:
        pred = model.predict([text])[0]
        prob = max(model.predict_proba([text])[0])
        return pred, round(prob, 2)
    except Exception as e:
        raise RuntimeError(f"Error predicting emotion: {e}")

# ---------------- FACE RECOGNITION ---------------- #

ENCODINGS_FILE = "face_encodings.pkl"

def load_encodings():
    """Load stored face embeddings."""
    if os.path.exists(ENCODINGS_FILE):
        try:
            with open(ENCODINGS_FILE, "rb") as f:
                return pickle.load(f)
        except Exception as e:
            print(f"Error loading encodings: {e}")
            return {"embeddings": [], "labels": []}
    return {"embeddings": [], "labels": []}

def save_encodings(data):
    """Save face embeddings to file."""
    try:
        with open(ENCODINGS_FILE, "wb") as f:
            pickle.dump(data, f)
    except Exception as e:
        raise RuntimeError(f"Error saving encodings: {e}")

def save_labelled_face(image_path: str, label: str):
    """
    Detect face, extract embedding using DeepFace, and save it with label.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
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
        print(f"Face embedding saved successfully for label: {label}")

    except Exception as e:
        raise ValueError(f"Error processing image: {e}")

def recognize_face(image_path: str) -> Optional[str]:
    """
    Compare a given face with stored embeddings and return matched label.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
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
            """Calculate cosine similarity between two vectors."""
            norm_a = norm(a)
            norm_b = norm(b)
            
            # Check for zero vectors
            if norm_a == 0 or norm_b == 0:
                return 0.0
                
            return dot(a, b) / (norm_a * norm_b)

        best_match = None
        best_score = 0.0

        for stored_embedding, label in zip(data["embeddings"], data["labels"]):
            score = cosine_similarity(embedding, stored_embedding)
            if score > best_score:
                best_score = score
                best_match = label

        return best_match if best_score > 0.75 else None

    except Exception as e:
        print(f"Error recognizing face: {e}")
        return None

# ---------------- MAIN EXECUTION ---------------- #

if __name__ == "__main__":
    # Example usage
    try:
        # Initialize emotion model
        initialize_emotion_model()
        
        # Test emotion detection
        test_text = "I am feeling very happy today!"
        emotion, confidence = detect_emotion(test_text)
        print(f"Detected emotion: {emotion} (confidence: {confidence})")
        
        print("Code is ready to use!")
        
    except Exception as e:
        print(f"Error during initialization: {e}")
        print("Please ensure ml_data.csv is available and contains 'text' and 'emotion' columns.")
