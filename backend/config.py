import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "15")))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", "7")))
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"
    JWT_ALGORITHM = "HS256"
    JWT_IDENTITY_CLAIM = "sub"
    JWT_ERROR_MESSAGE_KEY = "message"

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:password@localhost:5432/smartdoor_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "http://103.93.132.205:5000"
    )

    REDIS_URL = os.getenv("REDIS_URL", "redis://103.93.132.205:5000/0")

    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")
    CAPTCHA_SECRET = os.getenv("CAPTCHA_SECRET", "ABCD")

    EDGE_BASE_URL = os.getenv("EDGE_BASE_URL", "http://103.93.132.205:8000")

    DEVICE_SECRET_KEY = os.getenv("DEVICE_SECRET_KEY", "")
    DEVICE_TIMEOUT = int(os.getenv("DEVICE_TIMEOUT", "10"))
    DEVICE_POLL_INTERVAL = int(os.getenv("DEVICE_POLL_INTERVAL", "1"))

    API_KEY = os.getenv("API_KEY", "SuperRahasiaApiKey123!")
    SUPABASE_RLS_ENABLED = os.getenv("SUPABASE_RLS_ENABLED", "true").lower() == "true"