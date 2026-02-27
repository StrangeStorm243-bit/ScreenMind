"""ScreenMind desktop client — capture loop, overlay, voice hotkey."""

import threading
import time

import keyboard
import requests

from screenmind.capture import ScreenCapture
from screenmind.config import BACKEND_URL, CAPTURE_INTERVAL
from screenmind.overlay import Overlay

capture = ScreenCapture()

# Lock to prevent background captures from piling up
_analyzing = threading.Lock()

# Force a capture every FORCE_INTERVAL cycles even if screen hasn't changed
_FORCE_EVERY = 6  # every 6th cycle = every 30s at 5s interval


def handle_user_message(text: str) -> str:
    """Send user message + fresh screenshot to backend."""
    img = capture.capture()
    b64 = capture.to_base64(img)
    try:
        resp = requests.post(
            f"{BACKEND_URL}/analyze",
            json={"screenshot_b64": b64, "user_message": text},
            timeout=60,
        )
        return resp.json().get("response", "No response")
    except Exception as e:
        return f"Backend error: {e}"


def background_capture(overlay: Overlay):
    """Periodically capture screen and send for context updates."""
    cycle = 0
    while True:
        try:
            img = capture.capture()
            cycle += 1
            changed = capture.has_changed(img)
            force = (cycle % _FORCE_EVERY == 0)

            if changed or force:
                # Skip if a previous analysis is still in progress
                if not _analyzing.acquire(blocking=False):
                    time.sleep(CAPTURE_INTERVAL)
                    continue
                try:
                    b64 = capture.to_base64(img)
                    overlay.set_status("Analyzing screen...")
                    resp = requests.post(
                        f"{BACKEND_URL}/analyze",
                        json={"screenshot_b64": b64},
                        timeout=60,
                    )
                    overlay.set_status("Watching...")
                finally:
                    _analyzing.release()
            else:
                overlay.set_status("Watching...")
        except Exception:
            overlay.set_status("Watching...")
        time.sleep(CAPTURE_INTERVAL)


def main():
    overlay = Overlay(on_submit=handle_user_message)

    # Start background capture thread
    bg_thread = threading.Thread(target=background_capture, args=(overlay,), daemon=True)
    bg_thread.start()

    # Push-to-talk voice input
    def on_push_to_talk():
        overlay.add_message("Listening... (5 seconds)")
        overlay.set_status("Listening...")
        try:
            from screenmind.voice import listen_and_transcribe

            text = listen_and_transcribe(5.0)
            if text.strip():
                overlay.add_message(f"You (voice): {text}")
                overlay.set_status("Thinking...")
                response = handle_user_message(text)
                overlay.add_message(f"ScreenMind: {response}")
        except Exception as e:
            overlay.add_message(f"Voice error: {e}")
        overlay.set_status("Watching...")

    keyboard.add_hotkey(
        "ctrl+space",
        lambda: threading.Thread(target=on_push_to_talk, daemon=True).start(),
    )

    overlay.add_message("ScreenMind: I'm watching your screen. Ask me anything!")
    overlay.add_message("ScreenMind: Press Ctrl+Space for voice input.")
    overlay.run()


if __name__ == "__main__":
    main()
