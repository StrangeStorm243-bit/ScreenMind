"""ScreenMind voice input — record audio and transcribe via Whisper."""

import io
import tempfile

import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write as wav_write
from openai import OpenAI

from screenmind.config import OPENAI_API_KEY

SAMPLE_RATE = 16000
CHANNELS = 1

_client = OpenAI(api_key=OPENAI_API_KEY)


def record_audio(duration: float = 5.0) -> bytes:
    """Record audio from the default mic and return WAV bytes."""
    audio = sd.rec(
        int(duration * SAMPLE_RATE),
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype="int16",
    )
    sd.wait()

    buf = io.BytesIO()
    wav_write(buf, SAMPLE_RATE, audio)
    return buf.getvalue()


def transcribe(audio_bytes: bytes) -> str:
    """Send WAV bytes to OpenAI Whisper and return the transcript."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp.flush()
        tmp_path = tmp.name

    with open(tmp_path, "rb") as audio_file:
        transcript = _client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
        )
    return transcript.text


def listen_and_transcribe(duration: float = 5.0) -> str:
    """Record audio for *duration* seconds, then transcribe it."""
    audio_bytes = record_audio(duration)
    return transcribe(audio_bytes)
