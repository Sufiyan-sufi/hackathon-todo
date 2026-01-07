# Skill: voice_input

## Description
Process voice to text.

## Instructions
This skill handles voice-to-text conversion for voice-enabled todo applications, supporting speech recognition, audio processing, and multi-language voice commands.

## Speech Recognition Overview

**Voice Input Benefits:**
- Hands-free task creation
- Faster input than typing
- Accessibility for users with disabilities
- Natural language interaction
- Mobile-friendly interface

## Speech Recognition Strategies

### 1. Browser-based (Web Speech API)

#### JavaScript Implementation
```javascript
class VoiceTodoInput {
  constructor() {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      this.supported = false;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.supported = true;
    this.isListening = false;

    // Configuration
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    this.recognition.lang = 'en-US';  // Default language

    this._setupEventListeners();
  }

  _setupEventListeners() {
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Voice recognition started');
      this.onStart?.();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      this.onInterim?.(interimTranscript);
      if (finalTranscript) {
        this.onFinal?.(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEnd?.();
    };
  }

  start(language = 'en-US') {
    if (!this.supported) {
      throw new Error('Speech recognition not supported');
    }

    this.recognition.lang = language;
    this.recognition.start();
  }

  stop() {
    if (this.isListening) {
      this.recognition.stop();
    }
  }

  // Event handlers (set these from outside)
  onStart = null;
  onInterim = null;
  onFinal = null;
  onError = null;
  onEnd = null;
}
```

#### React Component
```typescript
import React, { useState, useEffect, useRef } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  language = 'en-US'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const voiceInput = useRef<VoiceTodoInput | null>(null);

  useEffect(() => {
    voiceInput.current = new VoiceTodoInput();

    voiceInput.current.onStart = () => {
      setIsListening(true);
      setError(null);
    };

    voiceInput.current.onInterim = (text: string) => {
      setInterimText(text);
    };

    voiceInput.current.onFinal = (text: string) => {
      setInterimText('');
      onTranscript(text);
    };

    voiceInput.current.onError = (err: string) => {
      setError(err);
      setIsListening(false);
    };

    voiceInput.current.onEnd = () => {
      setIsListening(false);
      setInterimText('');
    };

    return () => {
      voiceInput.current?.stop();
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      voiceInput.current?.stop();
    } else {
      voiceInput.current?.start(language);
    }
  };

  return (
    <div className="voice-input">
      <button
        onClick={toggleListening}
        className={`mic-button ${isListening ? 'listening' : ''}`}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        <MicIcon />
        {isListening && <span className="pulse-ring"></span>}
      </button>

      {interimText && (
        <div className="interim-text">{interimText}</div>
      )}

      {error && (
        <div className="error-message">Error: {error}</div>
      )}
    </div>
  );
};
```

### 2. Server-based (Python)

#### Using OpenAI Whisper
```python
import whisper
from typing import Optional, Union
from pathlib import Path
import numpy as np

class WhisperTranscriber:
    """OpenAI Whisper speech-to-text."""

    def __init__(self, model_size: str = "base"):
        """
        Initialize Whisper model.

        Args:
            model_size: Model size (tiny, base, small, medium, large)
        """
        self.model = whisper.load_model(model_size)

    def transcribe_file(
        self,
        audio_path: Union[str, Path],
        language: Optional[str] = None
    ) -> dict:
        """Transcribe audio file."""

        result = self.model.transcribe(
            str(audio_path),
            language=language,
            task="transcribe"
        )

        return {
            "text": result["text"],
            "language": result["language"],
            "segments": result["segments"]
        }

    def transcribe_array(
        self,
        audio: np.ndarray,
        language: Optional[str] = None
    ) -> dict:
        """Transcribe audio from numpy array."""

        result = self.model.transcribe(
            audio,
            language=language,
            task="transcribe"
        )

        return {
            "text": result["text"],
            "language": result["language"]
        }

    def translate_to_english(self, audio_path: Union[str, Path]) -> str:
        """Translate audio to English."""

        result = self.model.transcribe(
            str(audio_path),
            task="translate"  # Translates to English
        )

        return result["text"]
```

#### Using Google Speech-to-Text
```python
from google.cloud import speech_v1p1beta1 as speech
from typing import Optional
import io

class GoogleSpeechRecognizer:
    """Google Cloud Speech-to-Text API."""

    def __init__(self):
        self.client = speech.SpeechClient()

    def transcribe_file(
        self,
        audio_path: str,
        language_code: str = "en-US",
        sample_rate: int = 16000
    ) -> dict:
        """Transcribe audio file."""

        # Read audio file
        with io.open(audio_path, "rb") as audio_file:
            content = audio_file.read()

        audio = speech.RecognitionAudio(content=content)

        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=sample_rate,
            language_code=language_code,
            enable_automatic_punctuation=True,
            model="default"
        )

        # Perform recognition
        response = self.client.recognize(config=config, audio=audio)

        results = []
        for result in response.results:
            alternative = result.alternatives[0]
            results.append({
                "transcript": alternative.transcript,
                "confidence": alternative.confidence
            })

        return {
            "transcripts": results,
            "best_transcript": results[0]["transcript"] if results else "",
            "confidence": results[0]["confidence"] if results else 0.0
        }

    def streaming_transcribe(
        self,
        audio_stream,
        language_code: str = "en-US",
        sample_rate: int = 16000
    ):
        """Streaming transcription."""

        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=sample_rate,
            language_code=language_code,
            enable_automatic_punctuation=True
        )

        streaming_config = speech.StreamingRecognitionConfig(
            config=config,
            interim_results=True
        )

        # Stream audio
        requests = (
            speech.StreamingRecognizeRequest(audio_content=chunk)
            for chunk in audio_stream
        )

        responses = self.client.streaming_recognize(streaming_config, requests)

        for response in responses:
            for result in response.results:
                transcript = result.alternatives[0].transcript
                is_final = result.is_final

                yield {
                    "transcript": transcript,
                    "is_final": is_final,
                    "confidence": result.alternatives[0].confidence if is_final else None
                }
```

#### Using Assembly AI
```python
import assemblyai as aai
from typing import Optional

class AssemblyAITranscriber:
    """AssemblyAI speech-to-text."""

    def __init__(self, api_key: str):
        aai.settings.api_key = api_key
        self.transcriber = aai.Transcriber()

    def transcribe_file(self, audio_path: str) -> dict:
        """Transcribe audio file."""

        transcript = self.transcriber.transcribe(audio_path)

        return {
            "text": transcript.text,
            "confidence": transcript.confidence,
            "words": [
                {
                    "text": word.text,
                    "start": word.start,
                    "end": word.end,
                    "confidence": word.confidence
                }
                for word in transcript.words
            ]
        }

    def transcribe_with_speaker_labels(self, audio_path: str) -> dict:
        """Transcribe with speaker diarization."""

        config = aai.TranscriptionConfig(speaker_labels=True)
        transcript = self.transcriber.transcribe(audio_path, config=config)

        return {
            "text": transcript.text,
            "utterances": [
                {
                    "speaker": utterance.speaker,
                    "text": utterance.text,
                    "start": utterance.start,
                    "end": utterance.end
                }
                for utterance in transcript.utterances
            ]
        }
```

### 3. Complete Voice Service

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Literal
import tempfile
import os

app = FastAPI()

# Initialize transcribers
whisper_transcriber = WhisperTranscriber(model_size="base")

class TranscriptionResult(BaseModel):
    text: str
    language: Optional[str] = None
    confidence: Optional[float] = None
    method: str

class VoiceInputService:
    """Complete voice input service."""

    def __init__(self):
        self.whisper = WhisperTranscriber()
        # Add other transcribers as needed

    async def transcribe(
        self,
        audio_file: UploadFile,
        language: Optional[str] = None,
        method: Literal["whisper", "google"] = "whisper"
    ) -> TranscriptionResult:
        """Transcribe audio file."""

        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        try:
            if method == "whisper":
                result = self.whisper.transcribe_file(temp_path, language=language)
                return TranscriptionResult(
                    text=result["text"],
                    language=result["language"],
                    method="whisper"
                )

            # Add other methods as needed

        finally:
            # Clean up temp file
            os.unlink(temp_path)

voice_service = VoiceInputService()

@app.post("/api/voice/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Optional[str] = None,
    method: str = "whisper"
):
    """Transcribe audio to text."""

    try:
        result = await voice_service.transcribe(audio, language, method)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Audio Processing

### Audio Format Conversion
```python
from pydub import AudioSegment
from typing import Union
from pathlib import Path

class AudioProcessor:
    """Audio processing utilities."""

    @staticmethod
    def convert_to_wav(
        input_path: Union[str, Path],
        output_path: Union[str, Path],
        sample_rate: int = 16000,
        channels: int = 1
    ):
        """Convert audio to WAV format."""

        audio = AudioSegment.from_file(input_path)

        # Convert to mono and set sample rate
        audio = audio.set_channels(channels)
        audio = audio.set_frame_rate(sample_rate)

        # Export as WAV
        audio.export(output_path, format="wav")

    @staticmethod
    def split_on_silence(
        audio_path: Union[str, Path],
        min_silence_len: int = 500,
        silence_thresh: int = -40
    ):
        """Split audio on silence."""

        from pydub.silence import split_on_silence

        audio = AudioSegment.from_file(audio_path)

        chunks = split_on_silence(
            audio,
            min_silence_len=min_silence_len,
            silence_thresh=silence_thresh
        )

        return chunks

    @staticmethod
    def normalize_audio(audio_path: Union[str, Path]):
        """Normalize audio volume."""

        audio = AudioSegment.from_file(audio_path)
        normalized = audio.normalize()
        return normalized
```

## Multi-language Support

### Language Detection
```python
from typing import Optional

SUPPORTED_LANGUAGES = {
    "en-US": "English (US)",
    "en-GB": "English (UK)",
    "es-ES": "Spanish",
    "fr-FR": "French",
    "de-DE": "German",
    "hi-IN": "Hindi",
    "ur-PK": "Urdu (Pakistan)",
    "ar-SA": "Arabic",
}

class MultiLanguageVoiceService:
    """Voice service with multi-language support."""

    def __init__(self):
        self.whisper = WhisperTranscriber()

    def detect_and_transcribe(self, audio_path: str) -> dict:
        """Detect language and transcribe."""

        # Whisper automatically detects language
        result = self.whisper.transcribe_file(audio_path)

        return {
            "text": result["text"],
            "detected_language": result["language"],
            "language_name": SUPPORTED_LANGUAGES.get(
                result["language"],
                result["language"]
            )
        }
```

## Real-time Voice Commands

### WebSocket for Live Transcription
```python
from fastapi import WebSocket, WebSocketDisconnect
import asyncio

@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time voice transcription."""

    await websocket.accept()

    try:
        while True:
            # Receive audio chunk
            audio_data = await websocket.receive_bytes()

            # Process audio (pseudo-code)
            # In reality, you'd accumulate chunks and transcribe
            transcript = process_audio_chunk(audio_data)

            # Send transcript back
            if transcript:
                await websocket.send_json({
                    "transcript": transcript,
                    "is_final": False
                })

    except WebSocketDisconnect:
        print("Client disconnected")
```

## Voice Commands for Todo

### Command Patterns
```python
VOICE_COMMAND_PATTERNS = {
    "create": [
        r"(?:add|create|new)\s+(?:task|todo)\s+(.+)",
        r"(?:remind me to|i need to)\s+(.+)",
    ],
    "list": [
        r"(?:show|list|get)\s+(?:my\s+)?(?:tasks?|todos?)",
        r"what(?:'s| are)\s+(?:my\s+)?(?:tasks?|todos?)",
    ],
    "complete": [
        r"(?:complete|finish|done with)\s+(?:task\s+)?(.+)",
        r"mark\s+(.+?)\s+as\s+(?:done|completed)",
    ],
    "delete": [
        r"(?:delete|remove|cancel)\s+(?:task\s+)?(.+)",
    ],
}

def parse_voice_command(transcript: str) -> dict:
    """Parse voice command."""
    import re

    for intent, patterns in VOICE_COMMAND_PATTERNS.items():
        for pattern in patterns:
            match = re.search(pattern, transcript.lower())
            if match:
                return {
                    "intent": intent,
                    "text": match.group(1) if match.groups() else transcript,
                    "confidence": 0.9
                }

    # Default to create task
    return {
        "intent": "create",
        "text": transcript,
        "confidence": 0.5
    }
```

## Testing

```python
import pytest
from pathlib import Path

@pytest.fixture
def sample_audio():
    return Path("tests/fixtures/sample_audio.wav")

def test_whisper_transcription(sample_audio):
    transcriber = WhisperTranscriber()
    result = transcriber.transcribe_file(sample_audio)

    assert result["text"]
    assert result["language"]

def test_voice_command_parsing():
    transcript = "add task buy milk"
    command = parse_voice_command(transcript)

    assert command["intent"] == "create"
    assert "buy milk" in command["text"]

@pytest.mark.asyncio
async def test_transcription_endpoint(client):
    with open("tests/fixtures/sample_audio.wav", "rb") as f:
        response = await client.post(
            "/api/voice/transcribe",
            files={"audio": f}
        )

    assert response.status_code == 200
    assert "text" in response.json()
```

## Best Practices

1. **Handle background noise** with noise reduction
2. **Support multiple languages** for international users
3. **Provide visual feedback** during recording
4. **Allow editing** of transcribed text
5. **Cache common phrases** for faster recognition
6. **Implement error handling** for failed transcriptions
7. **Test with real voices** not just test audio
8. **Consider privacy** - process locally when possible
9. **Optimize audio format** (16kHz mono for best results)
10. **Provide fallback** to text input

## Browser Compatibility

| Browser | Web Speech API | WebRTC |
|---------|----------------|--------|
| Chrome  | ✅ | ✅ |
| Edge    | ✅ | ✅ |
| Safari  | ✅ | ✅ |
| Firefox | ❌ | ✅ |

## Notes

- Web Speech API is free but requires internet
- Whisper works offline but requires download (~140MB for base model)
- Google/Azure APIs are most accurate but have costs
- Consider privacy implications of voice data
- Compress audio before sending to server
- Test in noisy environments
- Support both push-to-talk and continuous listening modes
