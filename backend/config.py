import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "ml", "saved_models")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "agricrop-intelligent-irrigation-secret-key-2026")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(DATA_DIR, 'agricrop.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SAVED_MODELS_DIR = SAVED_MODELS_DIR
