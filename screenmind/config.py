import os
from dotenv import load_dotenv

load_dotenv()

REKA_API_KEY = os.getenv("REKA_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

CAPTURE_INTERVAL = 2  # seconds
SCREENSHOT_WIDTH = 1280  # resize target
HASH_THRESHOLD = 10  # perceptual hash diff threshold
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
