import os
from pathlib import Path
from dotenv import load_dotenv

_BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(_BASE_DIR / ".env")

def _split_env_list(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]

class Settings:
    ENV = os.getenv("ENV", "development")
    PROJECT_NAME = os.getenv("PROJECT_NAME", "SafeLive")

    MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME = os.getenv("DB_NAME", "safelive")

    SECRET_KEY = os.getenv("SECRET_KEY", "SAFELIVE_SECRET_2026")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    PASSWORD_RESET_EXPIRE_MINUTES = int(os.getenv("PASSWORD_RESET_EXPIRE_MINUTES", "30"))

    BASE_DIR = _BASE_DIR
    IMAGE_DIR = os.getenv("IMAGE_DIR", str(BASE_DIR / "images"))

    EMAIL_USER = os.getenv("EMAIL_USER", "safelive.alerts@gmail.com")
    EMAIL_PASS = os.getenv("EMAIL_PASS", "")
    EMAIL_FROM = os.getenv("EMAIL_FROM", EMAIL_USER)
    EMAIL_ALERT_TO = os.getenv("EMAIL_ALERT_TO", EMAIL_USER)
    SMS_ALERT_TO = os.getenv("SMS_ALERT_TO", "")
    WHATSAPP_ALERT_TO = os.getenv("WHATSAPP_ALERT_TO", "")
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_SMS_FROM = os.getenv("TWILIO_SMS_FROM", "")
    TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "")

    DOMAIN = os.getenv("DOMAIN", "https://safelive.in")
    CORS_ORIGINS = _split_env_list(os.getenv("CORS_ORIGINS")) or [
        "https://safelive.in",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ]

settings = Settings()

if settings.ENV.lower() == "production":
    if not os.getenv("SECRET_KEY"):
        raise RuntimeError("SECRET_KEY is required in production")
    if not os.getenv("EMAIL_PASS"):
        raise RuntimeError("EMAIL_PASS is required in production")
