#!/usr/bin/env python3
"""
Real-time Client Example for Echo ML Backend
This demonstrates all the real-time features including:
- WebSocket connections for emotion detection
- Real-time face recognition
- Audio streaming and processing
- Video processing
"""

import asyncio
import websockets
import json
import base64
import cv2
import numpy as np
import time
import threading
from typing import Optional, Dict, Any
import logging
from PIL import Image
from io import BytesIO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealTimeMLClient:
    """Client for real-time ML processing via WebSockets and HTTP"""
    
    def __init__(self, server_url: str = "ws://localhost:8000"):
        self.server_url = server_url
        self.websockets = {}
        self.is_connected = False
        self.camera = None
        self.audio_stream = None
        
    async def connect_emotion_ws(self):
        """Connect to emotion detection WebSocket"""
        try:
            uri = f"{self.server_url.replace('ws://', 'ws://').replace('http://', 'ws://')}/ws/emotion"
            websocket = await websockets.connect(uri)
            self.websockets['emotion'] = websocket
            logger.info("Connected to emotion WebSocket")
            return websocket
        except Exception as e:
            logger.error(f"Failed to connect to emotion WebSocket: {e}")
            return None
            
    async def connect_face_recognition_ws(self):
        """Connect to face recognition WebSocket"""
        try:
            uri = f"{self.server_url.replace('ws://', 'ws://').replace('http://', 'ws://')}/ws/face-recognition"
            websocket = await websockets.connect(uri)
            self.websockets['face'] = websocket
            logger.info("Connected to face recognition WebSocket")
            return websocket
        except Exception as e:
            logger.error(f"Failed to connect to face recognition WebSocket: {e}")
            return None
            
    async def connect_audio_ws(self):
        """Connect to audio streaming WebSocket"""
        try:
            uri = f"{self.server_url.replace('ws://', 'ws://').replace('http://', 'ws://')}/ws/audio-stream"
            websocket = await websockets.connect(uri)
            self.websockets['audio'] = websocket
            logger.info("Connected to audio WebSocket")
            return websocket
        except Exception as e:
            logger.error(f"Failed to connect to audio WebSocket: {e}")
            return None
            
    async def disconnect_all(self):
        """Disconnect from all WebSockets"""
        for name, ws in self.websockets.items():
            try:
                await ws.close()
                logger.info(f"Disconnected from {name} WebSocket")
            except Exception as e:
                logger.error(f"Error disconnecting from {name} WebSocket: {e}")
        self.websockets.clear()
        
    async def send_emotion_text(self, text: str, user_id: Optional[str] = None):
        """Send text for real-time emotion detection"""
        if 'emotion' not in self.websockets:
            logger.error("Not connected to emotion WebSocket")
            return None
            
        try:
            message = {
                "text": text,
                "user_id": user_id
            }
            await self.websockets['emotion'].send(json.dumps(message))
            
            # Wait for response
            response = await self.websockets['emotion'].recv()
            return json.loads(response)
            
        except Exception as e:
            logger.error(f"Error sending emotion text: {e}")
            return None
            
    async def send_face_image(self, image_path: str):
        """Send image for real-time face recognition"""
        if 'face' not in self.websockets:
            logger.error("Not connected to face recognition WebSocket")
            return None
            
        try:
            # Load and encode image
            with open(image_path, "rb") as f:
                image_data = f.read()
            image_base64 = base64.b64encode(image_data).decode()
            
            message = {
                "image": image_base64
            }
            await self.websockets['face'].send(json.dumps(message))
            
            # Wait for response
            response = await self.websockets['face'].recv()
            return json.loads(response)
            
        except Exception as e:
            logger.error(f"Error sending face image: {e}")
            return None
            
    async def send_audio_chunk(self, audio_data: bytes):
        """Send audio chunk for real-time processing"""
        if 'audio' not in self.websockets:
            logger.error("Not connected to audio WebSocket")
            return None
            
        try:
            audio_base64 = base64.b64encode(audio_data).decode()
            
            message = {
                "audio": audio_base64
            }
            await self.websockets['audio'].send(json.dumps(message))
            
            # Wait for response
            response = await self.websockets['audio'].recv()
            return json.loads(response)
            
        except Exception as e:
            logger.error(f"Error sending audio chunk: {e}")
            return None
            
    def start_camera_stream(self, camera_index: int = 0):
        """Start real-time camera stream for face recognition"""
        try:
            self.camera = cv2.VideoCapture(camera_index)
            if not self.camera.isOpened():
                logger.error("Could not open camera")
                return False
                
            logger.info("Camera stream started")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start camera: {e}")
            return False
            
    def stop_camera_stream(self):
        """Stop camera stream"""
        if self.camera:
            self.camera.release()
            self.camera = None
            logger.info("Camera stream stopped")
            
    def capture_frame(self) -> Optional[np.ndarray]:
        """Capture a single frame from camera"""
        if not self.camera:
            return None
            
        ret, frame = self.camera.read()
        if ret:
            return frame
        return None
        
    async def process_camera_frames(self, interval: float = 1.0):
        """Process camera frames at regular intervals"""
        if not self.camera:
            logger.error("Camera not started")
            return
            
        while self.camera and self.camera.isOpened():
            frame = self.capture_frame()
            if frame is not None:
                # Save frame temporarily
                temp_path = f"temp_frame_{int(time.time())}.jpg"
                cv2.imwrite(temp_path, frame)
                
                # Send for face recognition
                result = await self.send_face_image(temp_path)
                if result:
                    logger.info(f"Face recognition result: {result}")
                    
                # Cleanup
                import os
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
            await asyncio.sleep(interval)
            
    async def stream_emotions(self, texts: list, interval: float = 2.0):
        """Stream multiple texts for emotion detection"""
        for text in texts:
            result = await self.send_emotion_text(text)
            if result:
                logger.info(f"Emotion for '{text}': {result}")
            await asyncio.sleep(interval)
            
    async def stream_audio_file(self, audio_file_path: str, chunk_size: int = 1024):
        """Stream audio file in chunks for real-time processing"""
        try:
            with open(audio_file_path, "rb") as f:
                while True:
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                        
                    result = await self.send_audio_chunk(chunk)
                    if result:
                        logger.info(f"Audio processing result: {result}")
                        
                    await asyncio.sleep(0.1)  # Small delay between chunks
                    
        except Exception as e:
            logger.error(f"Error streaming audio file: {e}")

# Example usage functions
async def demo_emotion_detection():
    """Demonstrate real-time emotion detection"""
    client = RealTimeMLClient()
    
    try:
        # Connect to emotion WebSocket
        await client.connect_emotion_ws()
        
        # Test texts for emotion detection
        test_texts = [
            "I'm feeling really anxious today",
            "This is frustrating me so much",
            "I feel calm and peaceful now",
            "I'm exhausted from all this work",
            "I'm not sure where I am right now"
        ]
        
        # Stream emotions
        await client.stream_emotions(test_texts, interval=1.5)
        
    finally:
        await client.disconnect_all()

async def demo_face_recognition():
    """Demonstrate real-time face recognition"""
    client = RealTimeMLClient()
    
    try:
        # Connect to face recognition WebSocket
        await client.connect_face_recognition_ws()
        
        # Start camera
        if client.start_camera_stream():
            # Process frames for 10 seconds
            await asyncio.wait_for(
                client.process_camera_frames(interval=2.0), 
                timeout=10.0
            )
            client.stop_camera_stream()
            
    finally:
        await client.disconnect_all()

async def demo_audio_processing():
    """Demonstrate real-time audio processing"""
    client = RealTimeMLClient()
    
    try:
        # Connect to audio WebSocket
        await client.connect_audio_ws()
        
        # Note: This would require an actual audio file
        # For demo purposes, we'll create a dummy audio chunk
        dummy_audio = b"\x00" * 1024  # 1KB of silence
        
        result = await client.send_audio_chunk(dummy_audio)
        if result:
            logger.info(f"Audio processing result: {result}")
            
    finally:
        await client.disconnect_all()

async def demo_comprehensive():
    """Demonstrate all real-time features together"""
    client = RealTimeMLClient()
    
    try:
        # Connect to all WebSockets
        await asyncio.gather(
            client.connect_emotion_ws(),
            client.connect_face_recognition_ws(),
            client.connect_audio_ws()
        )
        
        logger.info("Connected to all WebSockets")
        
        # Start camera
        if client.start_camera_stream():
            # Create tasks for different processing
            tasks = [
                asyncio.create_task(client.process_camera_frames(interval=3.0)),
                asyncio.create_task(client.stream_emotions([
                    "I'm feeling anxious",
                    "This is frustrating",
                    "I feel calm now"
                ], interval=4.0))
            ]
            
            # Run for 15 seconds
            await asyncio.wait_for(
                asyncio.gather(*tasks), 
                timeout=15.0
            )
            
            client.stop_camera_stream()
            
    finally:
        await client.disconnect_all()

# Main execution
async def main():
    """Main function to run demonstrations"""
    print("Real-time ML Client Examples")
    print("=" * 40)
    
    while True:
        print("\nChoose a demo:")
        print("1. Emotion Detection")
        print("2. Face Recognition")
        print("3. Audio Processing")
        print("4. Comprehensive Demo")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == "1":
            print("\nRunning Emotion Detection Demo...")
            await demo_emotion_detection()
        elif choice == "2":
            print("\nRunning Face Recognition Demo...")
            await demo_face_recognition()
        elif choice == "3":
            print("\nRunning Audio Processing Demo...")
            await demo_audio_processing()
        elif choice == "4":
            print("\nRunning Comprehensive Demo...")
            await demo_comprehensive()
        elif choice == "5":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        logger.error(f"Error in main: {e}")

