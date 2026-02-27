"""Reka Vision analysis for desktop screenshots."""

import requests

from screenmind.config import REKA_API_KEY

_API_URL = "https://api.reka.ai/v1/chat"

DEFAULT_PROMPT = (
    "Describe this desktop screenshot. "
    "What applications are open? What content is visible? "
    "What is the user currently working on?"
)


def analyze_screenshot(base64_image: str, question: str = None) -> str:
    """Analyze a screenshot using Reka Vision.

    Args:
        base64_image: JPEG image encoded as base64 string.
        question: Optional question about the screenshot.

    Returns:
        Model's text description of the screenshot.
    """
    prompt = question or DEFAULT_PROMPT
    try:
        resp = requests.post(
            _API_URL,
            headers={"X-Api-Key": REKA_API_KEY, "Content-Type": "application/json"},
            json={
                "model": "reka-flash",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": f"data:image/jpeg;base64,{base64_image}",
                            },
                            {"type": "text", "text": prompt},
                        ],
                    }
                ],
            },
            timeout=60,
        )
        resp.raise_for_status()
        return resp.json()["responses"][0]["message"]["content"]
    except Exception as exc:
        return f"Could not analyze screen: {exc}"
