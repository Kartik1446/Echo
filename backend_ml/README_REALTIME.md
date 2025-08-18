# Echo ML Backend - Real-time Features

This backend provides comprehensive real-time ML capabilities including emotion detection, face recognition, and audio processing through WebSockets and streaming endpoints.

## 🚀 Features

### Real-time Capabilities
- **WebSocket Support**: Bidirectional real-time communication
- **Real-time Emotion Detection**: Stream text and get instant emotion analysis
- **Real-time Face Recognition**: Process camera feeds and images in real-time
- **Real-time Audio Processing**: Stream audio chunks for live speech-to-text and emotion detection
- **Video Stream Processing**: Analyze video files frame-by-frame
- **Camera Integration**: Direct camera access for live processing

## 📋 Prerequisites

- Python 3.8+
- Webcam (for face recognition demos)
- Microphone (for audio processing demos)
- Sufficient RAM (4GB+ recommended for real-time processing)

## 🛠️ Installation

1. **Clone and navigate to the project:**
```bash
cd backend-ml
```

2. **Install dependencies:**
```bash
pip install -r requirements_realtime.txt
```

3. **Ensure you have the ML data file:**
```bash
# Make sure ml_data.csv exists with 'text' and 'emotion' columns
```

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
python app.py
```
The server will start on `http://localhost:8000`

### 2. Test Real-time Features
```bash
python realtime_client_example.py
```

## 🔌 WebSocket Endpoints

### Emotion Detection WebSocket
```javascript
// Connect to emotion detection
const ws = new WebSocket('ws://localhost:8000/ws/emotion');

// Send text for emotion analysis
ws.send(JSON.stringify({
    "text": "I'm feeling anxious today",
    "user_id": "user123"
}));

// Receive real-time responses
ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    console.log('Emotion:', response.emotion);
    console.log('Confidence:', response.confidence);
};
```

### Face Recognition WebSocket
```javascript
// Connect to face recognition
const ws = new WebSocket('ws://localhost:8000/ws/face-recognition');

// Send base64 encoded image
ws.send(JSON.stringify({
    "image": "base64_encoded_image_string"
}));

// Receive recognition results
ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    console.log('Recognized:', response.recognized);
    console.log('Message:', response.message);
};
```

### Audio Streaming WebSocket
```javascript
// Connect to audio processing
const ws = new WebSocket('ws://localhost:8000/ws/audio-stream');

// Send base64 encoded audio chunk
ws.send(JSON.stringify({
    "audio": "base64_encoded_audio_chunk"
}));

// Receive processing results
ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    console.log('Text:', response.text);
    console.log('Emotion:', response.emotion);
};
```

## 📡 HTTP Endpoints

### Real-time Video Processing
```bash
# Process video for emotion detection
curl -X POST "http://localhost:8000/video-stream/emotion" \
     -F "file=@video.mp4"

# Process video for face recognition
curl -X POST "http://localhost:8000/video-stream/face-recognition" \
     -F "file=@video.mp4"
```

### Streaming Endpoints
```bash
# Stream emotion detection
curl -X POST "http://localhost:8000/stream-emotion" \
     -H "Content-Type: application/json" \
     -d '{"text": "I feel happy", "user_id": "user123"}'

# Get real-time emotion feed
curl "http://localhost:8000/stream-emotion-feed"
```

### Camera Control
```bash
# Start camera
curl "http://localhost:8000/camera/start"

# Stop camera
curl "http://localhost:8000/camera/stop"
```

## 🎯 Real-time Processing Classes

### RealTimeVideoProcessor
```python
from realtime_utils import RealTimeVideoProcessor

# Initialize processor
processor = RealTimeVideoProcessor(camera_index=0, max_fps=30)

# Add frame processing callback
def process_frame(frame, metadata):
    # Process each frame in real-time
    print(f"Processing frame {metadata['frame_number']}")
    
processor.add_frame_callback(process_frame)

# Start processing
processor.start()

# Stop when done
processor.stop()
```

### RealTimeEmotionTracker
```python
from realtime_utils import RealTimeEmotionTracker

# Initialize tracker
tracker = RealTimeEmotionTracker(window_size=30)

# Add emotions
tracker.add_emotion("anxious", 0.85)
tracker.add_emotion("calm", 0.92)

# Get analysis
dominant = tracker.get_dominant_emotion()
trend = tracker.get_emotion_trend()
summary = tracker.get_emotion_summary()
```

### RealTimeFaceTracker
```python
from realtime_utils import RealTimeFaceTracker

# Initialize tracker
tracker = RealTimeFaceTracker(max_faces=10)

# Add face detections
tracker.add_face_detection("face_1", "John", 0.95, (100, 100, 200, 200))

# Get summary
summary = tracker.get_face_summary()
timeline = tracker.get_face_timeline("face_1", window_minutes=5)
```

## 🔧 Configuration

### Environment Variables
```bash
# Camera settings
CAMERA_INDEX=0
MAX_FPS=30

# WebSocket settings
WS_MAX_CONNECTIONS=100
WS_HEARTBEAT_INTERVAL=30

# Processing settings
EMOTION_WINDOW_SIZE=30
FACE_RECOGNITION_THRESHOLD=0.75
```

### Performance Tuning
```python
# Adjust frame processing rate
processor = RealTimeVideoProcessor(max_fps=15)  # Lower FPS for better performance

# Adjust emotion tracking window
tracker = RealTimeEmotionTracker(window_size=60)  # Larger window for more stable analysis

# Adjust face recognition threshold
# Modify in model_utils.py: recognize_face function
```

## 📊 Monitoring and Logging

### Real-time Metrics
```python
# Get connection status
print(f"Active WebSocket connections: {len(manager.active_connections)}")

# Get processing statistics
emotion_summary = tracker.get_emotion_summary()
face_summary = face_tracker.get_face_summary()
```

### Log Analysis
```bash
# Monitor real-time logs
tail -f app.log | grep "WebSocket\|Real-time\|Processing"
```

## 🧪 Testing

### Unit Tests
```bash
pytest test_realtime.py -v
```

### Integration Tests
```bash
# Test WebSocket connections
python -m pytest tests/test_websockets.py -v

# Test real-time processing
python -m pytest tests/test_realtime_processing.py -v
```

### Load Testing
```bash
# Test multiple WebSocket connections
python load_test_websockets.py --connections 100 --duration 60
```

## 🚨 Troubleshooting

### Common Issues

1. **Camera not accessible**
   ```bash
   # Check camera permissions
   ls -la /dev/video*
   
   # Test with OpenCV
   python -c "import cv2; cap = cv2.VideoCapture(0); print(cap.isOpened())"
   ```

2. **WebSocket connection failed**
   ```bash
   # Check if server is running
   curl http://localhost:8000/health
   
   # Check WebSocket endpoint
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
        -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
        -H "Sec-WebSocket-Version: 13" \
        http://localhost:8000/ws/emotion
   ```

3. **Memory issues during real-time processing**
   ```python
   # Reduce frame buffer size
   processor = RealTimeVideoProcessor(max_fps=15)
   
   # Clear emotion history periodically
   tracker.emotion_history.clear()
   ```

### Performance Optimization

1. **Reduce processing load:**
   ```python
   # Process every nth frame
   if frame_count % 3 == 0:  # Process every 3rd frame
       process_frame(frame)
   ```

2. **Use async processing:**
   ```python
   # Process frames asynchronously
   async def process_frame_async(frame):
       await asyncio.create_task(process_frame_task(frame))
   ```

3. **Implement frame skipping:**
   ```python
   # Skip frames if processing is behind
   if time.time() - last_process_time < 0.033:  # 30 FPS
       continue  # Skip this frame
   ```

## 🔮 Future Enhancements

- **GPU Acceleration**: CUDA support for faster processing
- **Edge Computing**: Optimize for low-power devices
- **Multi-modal Fusion**: Combine video, audio, and text for better analysis
- **Real-time Learning**: Adapt models based on user feedback
- **Distributed Processing**: Scale across multiple servers

## 📚 API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation after starting the server.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the logs for error details

