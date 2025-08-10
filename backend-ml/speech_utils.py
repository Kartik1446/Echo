import speech_recognition as sr

def audio_to_text(audio_path: str) -> str:
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_path) as source:
        audio = recognizer.record(source)
        try:
            return recognizer.recognize_google(audio) # type: ignore
        except sr.UnknownValueError:
            return "Sorry, I could not understand the audio."
        except sr.RequestError:
            return "Speech recognition service is unavailable."

def speak(text: str) -> None:
    """Convert text to speech using pyttsx3 or gTTS"""
    try:
        # Try using pyttsx3 first (offline)
        import pyttsx3
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except ImportError:
        try:
            # Fallback to gTTS (online, requires internet)
            from gtts import gTTS
            import os
            import tempfile
            import subprocess
            
            # Create temporary audio file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
                tts = gTTS(text=text, lang='en')
                tts.save(tmp_file.name)
                tmp_file_path = tmp_file.name
            
            # Play the audio file (platform dependent)
            try:
                if os.name == 'nt':  # Windows
                    os.startfile(tmp_file_path)
                else:  # Linux/Mac
                    subprocess.run(['xdg-open', tmp_file_path])
            except:
                pass
            
            # Clean up after a delay
            import threading
            import time
            def cleanup():
                time.sleep(5)  # Wait 5 seconds
                try:
                    os.unlink(tmp_file_path)
                except:
                    pass
            
            threading.Thread(target=cleanup, daemon=True).start()
            
        except ImportError:
            print(f"Text-to-speech not available. Install pyttsx3 or gTTS. Text: {text}")
        except Exception as e:
            print(f"Text-to-speech failed: {e}")
    except Exception as e:
        print(f"Text-to-speech failed: {e}")
