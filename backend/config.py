import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:password@localhost:5432/smartdoor_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")
    CAPTCHA_SECRET = os.getenv("CAPTCHA_SECRET", "ABCD")

    EDGE_BASE_URL = os.getenv("EDGE_BASE_URL", "http://103.93.132.205:8000")

    DEVICE_SECRET_KEY = os.getenv("DEVICE_SECRET_KEY", "")
    DEVICE_TIMEOUT = int(os.getenv("DEVICE_TIMEOUT", "10"))
    DEVICE_POLL_INTERVAL = int(os.getenv("DEVICE_POLL_INTERVAL", "1"))