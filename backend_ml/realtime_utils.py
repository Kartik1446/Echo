import cv2
import numpy as np
import asyncio
import threading
import time
from typing import Optional, Callable, Dict, Any
import logging
from collections import deque
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealTimeVideoProcessor:
    """Real-time video processing with frame-by-frame analysis"""
    
    def __init__(self, camera_index: int = 0, max_fps: int = 30):
        self.camera_index = camera_index
        self.max_fps = max_fps
        self.frame_interval = 1.0 / max_fps
        self.is_running = False
        self.cap = None
        self.processing_thread = None
        self.frame_callbacks = []
        self.emotion_history = deque(maxlen=100)
        self.face_recognition_history = deque(maxlen=100)
        
    def add_frame_callback(self, callback: Callable[[np.ndarray, Dict[str, Any]], None]):
        """Add a callback function to process each frame"""
        self.frame_callbacks.append(callback)
        
    def start(self):
        """Start real-time video processing"""
        if self.is_running:
            logger.warning("Video processor is already running")
            return
            
        self.cap = cv2.VideoCapture(self.camera_index)
        if not self.cap.isOpened():
            raise RuntimeError(f"Could not open camera at index {self.camera_index}")
            
        self.is_running = True
        self.processing_thread = threading.Thread(target=self._process_frames)
        self.processing_thread.daemon = True
        self.processing_thread.start()
        logger.info("Real-time video processing started")
        
    def stop(self):
        """Stop real-time video processing"""
        self.is_running = False
        if self.processing_thread:
            self.processing_thread.join(timeout=2.0)
        if self.cap:
            self.cap.release()
        logger.info("Real-time video processing stopped")
        
    def _process_frames(self):
        """Internal method to process frames in a separate thread"""
        last_frame_time = 0
        
        while self.is_running:
            current_time = time.time()
            
            # Control frame rate
            if current_time - last_frame_time < self.frame_interval:
                time.sleep(0.001)  # Small sleep to prevent busy waiting
                continue
                
            ret, frame = self.cap.read()
            if not ret:
                logger.warning("Failed to read frame from camera")
                continue
                
            # Create frame metadata
            frame_data = {
                "timestamp": current_time,
                "frame_number": int(current_time * self.max_fps),
                "size": frame.shape
            }
            
            # Process frame with all callbacks
            for callback in self.frame_callbacks:
                try:
                    callback(frame, frame_data)
                except Exception as e:
                    logger.error(f"Error in frame callback: {e}")
                    
            last_frame_time = current_time

class RealTimeAudioProcessor:
    """Real-time audio processing with streaming capabilities"""
    
    def __init__(self, sample_rate: int = 16000, chunk_size: int = 1024):
        self.sample_rate = sample_rate
        self.chunk_size = chunk_size
        self.is_running = False
        self.audio_callbacks = []
        self.audio_buffer = deque(maxlen=1000)  # Store last 1000 audio chunks
        
    def add_audio_callback(self, callback: Callable[[bytes, Dict[str, Any]], None]):
        """Add a callback function to process audio chunks"""
        self.audio_callbacks.append(callback)
        
    def process_audio_chunk(self, audio_data: bytes, metadata: Dict[str, Any] = None):
        """Process a single audio chunk"""
        if metadata is None:
            metadata = {}
            
        metadata.update({
            "timestamp": time.time(),
            "chunk_size": len(audio_data),
            "sample_rate": self.sample_rate
        })
        
        # Store in buffer
        self.audio_buffer.append((audio_data, metadata))
        
        # Process with callbacks
        for callback in self.audio_callbacks:
            try:
                callback(audio_data, metadata)
            except Exception as e:
                logger.error(f"Error in audio callback: {e}")
                
    def get_audio_buffer(self, max_chunks: int = 100) -> list:
        """Get recent audio chunks from buffer"""
        return list(self.audio_buffer)[-max_chunks:]

class RealTimeEmotionTracker:
    """Track emotions in real-time with temporal analysis"""
    
    def __init__(self, window_size: int = 30):
        self.window_size = window_size
        self.emotion_history = deque(maxlen=window_size)
        self.emotion_weights = {
            "anxious": 1.2,      # Higher weight for concerning emotions
            "frustrated": 1.1,
            "exhausted": 1.0,
            "disoriented": 1.3,
            "calm": 0.8,
            "neutral": 0.5
        }
        
    def add_emotion(self, emotion: str, confidence: float, timestamp: float = None):
        """Add a new emotion detection result"""
        if timestamp is None:
            timestamp = time.time()
            
        self.emotion_history.append({
            "emotion": emotion,
            "confidence": confidence,
            "timestamp": timestamp
        })
        
    def get_dominant_emotion(self) -> Optional[str]:
        """Get the dominant emotion over the recent window"""
        if not self.emotion_history:
            return None
            
        emotion_counts = {}
        weighted_scores = {}
        
        for entry in self.emotion_history:
            emotion = entry["emotion"]
            confidence = entry["confidence"]
            weight = self.emotion_weights.get(emotion, 1.0)
            
            if emotion not in emotion_counts:
                emotion_counts[emotion] = 0
                weighted_scores[emotion] = 0.0
                
            emotion_counts[emotion] += 1
            weighted_scores[emotion] += confidence * weight
            
        if not emotion_counts:
            return None
            
        # Return emotion with highest weighted score
        return max(weighted_scores.items(), key=lambda x: x[1])[0]
        
    def get_emotion_trend(self) -> str:
        """Get the trend of emotions (improving, worsening, stable)"""
        if len(self.emotion_history) < 10:
            return "insufficient_data"
            
        recent_emotions = list(self.emotion_history)[-10:]
        early_emotions = list(self.emotion_history)[-20:-10] if len(self.emotion_history) >= 20 else []
        
        if not early_emotions:
            return "stable"
            
        # Calculate average confidence for recent vs early emotions
        recent_avg = sum(e["confidence"] for e in recent_emotions) / len(recent_emotions)
        early_avg = sum(e["confidence"] for e in early_emotions) / len(early_emotions)
        
        if recent_avg > early_avg + 0.1:
            return "improving"
        elif recent_avg < early_avg - 0.1:
            return "worsening"
        else:
            return "stable"
            
    def get_emotion_summary(self) -> Dict[str, Any]:
        """Get comprehensive emotion summary"""
        if not self.emotion_history:
            return {"status": "no_data"}
            
        return {
            "dominant_emotion": self.get_dominant_emotion(),
            "trend": self.get_emotion_trend(),
            "total_detections": len(self.emotion_history),
            "recent_emotions": list(self.emotion_history)[-5:],
            "window_size": self.window_size
        }

class RealTimeFaceTracker:
    """Track faces in real-time with recognition history"""
    
    def __init__(self, max_faces: int = 10):
        self.max_faces = max_faces
        self.face_history = deque(maxlen=max_faces * 10)  # Store more history for faces
        self.known_faces = {}  # face_id -> label mapping
        self.face_counter = 0
        
    def add_face_detection(self, face_id: str, label: Optional[str], confidence: float, 
                          bbox: tuple, timestamp: float = None):
        """Add a new face detection result"""
        if timestamp is None:
            timestamp = time.time()
            
        if face_id not in self.known_faces and label:
            self.known_faces[face_id] = label
            
        self.face_history.append({
            "face_id": face_id,
            "label": label,
            "confidence": confidence,
            "bbox": bbox,
            "timestamp": timestamp
        })
        
    def get_face_summary(self) -> Dict[str, Any]:
        """Get comprehensive face tracking summary"""
        if not self.face_history:
            return {"status": "no_faces_detected"}
            
        recent_faces = list(self.face_history)[-20:]  # Last 20 detections
        
        # Count unique faces
        unique_faces = set()
        face_labels = {}
        
        for entry in recent_faces:
            face_id = entry["face_id"]
            unique_faces.add(face_id)
            if entry["label"]:
                face_labels[face_id] = entry["label"]
                
        return {
            "total_faces_detected": len(unique_faces),
            "known_faces": len(face_labels),
            "unknown_faces": len(unique_faces) - len(face_labels),
            "recent_detections": recent_faces[-5:],
            "face_labels": face_labels
        }
        
    def get_face_timeline(self, face_id: str, window_minutes: int = 5) -> list:
        """Get timeline of detections for a specific face"""
        if not self.face_history:
            return []
            
        current_time = time.time()
        window_start = current_time - (window_minutes * 60)
        
        timeline = []
        for entry in self.face_history:
            if (entry["face_id"] == face_id and 
                entry["timestamp"] >= window_start):
                timeline.append(entry)
                
        return sorted(timeline, key=lambda x: x["timestamp"])

# Utility functions for real-time processing
def create_frame_metadata(frame: np.ndarray, frame_number: int, timestamp: float) -> Dict[str, Any]:
    """Create metadata for a video frame"""
    return {
        "frame_number": frame_number,
        "timestamp": timestamp,
        "width": frame.shape[1],
        "height": frame.shape[0],
        "channels": frame.shape[2] if len(frame.shape) > 2 else 1,
        "dtype": str(frame.dtype)
    }

def encode_frame_to_base64(frame: np.ndarray) -> str:
    """Encode a frame to base64 string for WebSocket transmission"""
    import base64
    from io import BytesIO
    from PIL import Image
    
    # Convert BGR to RGB (OpenCV uses BGR)
    if len(frame.shape) == 3:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    else:
        frame_rgb = frame
        
    # Convert to PIL Image and encode
    pil_image = Image.fromarray(frame_rgb)
    buffer = BytesIO()
    pil_image.save(buffer, format="JPEG", quality=85)
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return img_str

def decode_base64_to_frame(base64_string: str) -> np.ndarray:
    """Decode base64 string back to numpy array"""
    import base64
    from io import BytesIO
    from PIL import Image
    
    # Decode base64
    img_data = base64.b64decode(base64_string)
    
    # Convert to PIL Image
    pil_image = Image.open(BytesIO(img_data))
    
    # Convert to numpy array
    frame = np.array(pil_image)
    
    # Convert RGB to BGR if needed
    if len(frame.shape) == 3:
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
    return frame

# Example usage and testing
if __name__ == "__main__":
    # Test the real-time processors
    print("Real-time utilities loaded successfully!")
    print("Available classes:")
    print("- RealTimeVideoProcessor")
    print("- RealTimeAudioProcessor") 
    print("- RealTimeEmotionTracker")
    print("- RealTimeFaceTracker")
    print("\nUtility functions:")
    print("- create_frame_metadata")
    print("- encode_frame_to_base64")
    print("- decode_base64_to_frame")

