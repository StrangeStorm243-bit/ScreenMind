"""Screen capture with perceptual hash change detection."""

import base64
from io import BytesIO

import imagehash
import mss
from PIL import Image

from screenmind.config import HASH_THRESHOLD, SCREENSHOT_WIDTH


class ScreenCapture:
    def __init__(self):
        self._last_hash = None

    def capture(self) -> Image.Image:
        """Grab primary monitor, convert to RGB, resize to target width."""
        with mss.mss() as sct:
            raw = sct.grab(sct.monitors[1])
        # mss returns BGRX; convert via PIL
        img = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")
        ratio = SCREENSHOT_WIDTH / img.width
        new_height = int(img.height * ratio)
        return img.resize((SCREENSHOT_WIDTH, new_height), Image.LANCZOS)

    def has_changed(self, img: Image.Image) -> bool:
        """Return True if perceptual hash diff exceeds threshold."""
        current_hash = imagehash.phash(img)
        if self._last_hash is None:
            self._last_hash = current_hash
            return True
        diff = current_hash - self._last_hash
        self._last_hash = current_hash
        return diff > HASH_THRESHOLD

    def to_base64(self, img: Image.Image) -> str:
        """Encode image as JPEG base64 string."""
        buf = BytesIO()
        img.save(buf, format="JPEG", quality=80)
        return base64.b64encode(buf.getvalue()).decode("utf-8")
