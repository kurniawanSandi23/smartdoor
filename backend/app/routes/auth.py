import base64
import hashlib
import random
import string
from datetime import datetime, timedelta

import redis
from flask import Blueprint, current_app, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import check_password_hash

from app.utils.response import success_response, error_response
from app.utils.auth_utils import require_api_key


def _is_preflight():
    return request.method == "OPTIONS"


auth_bp = Blueprint("auth", __name__)

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per hour"]
)

limiter.request_filter(_is_preflight)

REDIS_CLIENT = None
IN_MEMORY_STORE = None

MAX_FAILED_ATTEMPTS = 3
LOCKOUT_SECONDS = 60
CAPTCHA_TTL_SECONDS = 120
CAPTCHA_LENGTH = 5


class LocalRedisFallback:
    def __init__(self):
        self.store = {}

    def _cleanup(self, key):
        item = self.store.get(key)
        if not item:
            return None
        if item["expires_at"] is not None and datetime.utcnow() > item["expires_at"]:
            self.store.pop(key, None)
            return None
        return item

    def setex(self, key, ttl, value):
        self.store[key] = {
            "value": value,
            "expires_at": datetime.utcnow() + timedelta(seconds=ttl),
        }

    def get(self, key):
        item = self._cleanup(key)
        return item["value"] if item else None

    def delete(self, key):
        self.store.pop(key, None)

    def exists(self, key):
        return 1 if self.get(key) is not None else 0

    def incr(self, key):
        current = self.get(key)
        next_value = int(current or 0) + 1
        expiry = None
        item = self.store.get(key)
        if item:
            expiry = item["expires_at"]
        self.store[key] = {
            "value": str(next_value),
            "expires_at": expiry or (datetime.utcnow() + timedelta(seconds=LOCKOUT_SECONDS))
        }
        return next_value

    def expire(self, key, ttl):
        item = self._cleanup(key)
        if item:
            item["expires_at"] = datetime.utcnow() + timedelta(seconds=ttl)
            self.store[key] = item
            return True
        return False


def init_limiter(app):
    limiter.init_app(app)


def _get_redis():
    global REDIS_CLIENT, IN_MEMORY_STORE
    if REDIS_CLIENT is not None:
        return REDIS_CLIENT

    redis_url = current_app.config.get("REDIS_URL", "redis://localhost:6379/0")
    try:
        client = redis.Redis.from_url(redis_url, decode_responses=True)
        client.ping()
        REDIS_CLIENT = client
        return REDIS_CLIENT
    except redis.RedisError:
        if IN_MEMORY_STORE is None:
            IN_MEMORY_STORE = LocalRedisFallback()
        return IN_MEMORY_STORE


def _client_key():
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.remote_addr or "unknown"


def _captcha_key(challenge_id):
    return f"auth:captcha:{challenge_id}"


def _failed_key(username, client_key):
    return f"auth:failed:{username}:{client_key}"


def _lock_key(username, client_key):
    return f"auth:lock:{username}:{client_key}"


def _random_captcha():
    alphabet = string.ascii_uppercase + string.digits
    return "".join(random.choice(alphabet) for _ in range(CAPTCHA_LENGTH))


def _hash_captcha(value: str):
    return hashlib.sha256(value.upper().encode("utf-8")).hexdigest()


def _build_captcha_svg(text: str):
    noise_lines = ""
    for _ in range(6):
        x1 = random.randint(0, 180)
        y1 = random.randint(0, 60)
        x2 = random.randint(0, 180)
        y2 = random.randint(0, 60)
        noise_lines += (
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
            f'stroke="#94a3b8" stroke-width="1" opacity="0.35"/>'
        )

    chars = ""
    start_x = 22
    for index, char in enumerate(text):
        rotate = random.randint(-18, 18)
        y = random.randint(34, 42)
        x = start_x + index * 28 + random.randint(-3, 3)
        chars += (
            f'<text x="{x}" y="{y}" fill="#0f172a" font-size="28" '
            f'font-family="monospace" font-weight="700" '
            f'transform="rotate({rotate} {x} {y})">{char}</text>'
        )

    svg = f"""
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="60" viewBox="0 0 180 60">
      <rect width="180" height="60" rx="12" fill="#f8fafc"/>
      <rect x="1" y="1" width="178" height="58" rx="11" fill="none" stroke="#cbd5e1"/>
      {noise_lines}
      {chars}
      <circle cx="20" cy="18" r="1.5" fill="#94a3b8" opacity="0.5"/>
      <circle cx="160" cy="48" r="1.5" fill="#94a3b8" opacity="0.5"/>
    </svg>
    """
    return svg.strip()


@auth_bp.get("/captcha")
@limiter.limit("10 per minute")
def get_captcha():
    try:
        redis_client = _get_redis()
        challenge_id = hashlib.sha256(
            f"{random.random()}:{request.remote_addr}:{random.random()}".encode("utf-8")
        ).hexdigest()

        captcha_text = _random_captcha()
        captcha_hash = _hash_captcha(captcha_text)
        redis_client.setex(_captcha_key(challenge_id), CAPTCHA_TTL_SECONDS, captcha_hash)

        captcha_svg = _build_captcha_svg(captcha_text)
        captcha_svg_b64 = base64.b64encode(captcha_svg.encode("utf-8")).decode("utf-8")

        return success_response({
            "challengeId": challenge_id,
            "captchaSvg": f"data:image/svg+xml;base64,{captcha_svg_b64}",
            "expiresIn": CAPTCHA_TTL_SECONDS
        }, "Captcha generated", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@auth_bp.post("/login")
@auth_bp.post("/Login")
@limiter.limit("5 per minute")
def login():
    try:
        data = request.get_json(silent=True) or {}

        username = str(data.get("username", "")).strip()
        password = str(data.get("password", "")).strip()
        captcha_input = str(data.get("captchaInput", "")).strip()
        challenge_id = str(data.get("challengeId", "")).strip()

        if not username or not password or not captcha_input or not challenge_id:
            return error_response(
                "username, password, captchaInput, dan challengeId wajib diisi",
                400
            )

        redis_client = _get_redis()
        client_key = _client_key()

        if redis_client.exists(_lock_key(username, client_key)):
            return error_response(
                "Akses dikunci sementara karena 3 kali gagal login",
                429
            )

        captcha_hash = redis_client.get(_captcha_key(challenge_id))
        if not captcha_hash:
            failed_key = _failed_key(username, client_key)
            attempts = redis_client.incr(failed_key)
            if attempts == 1:
                redis_client.expire(failed_key, LOCKOUT_SECONDS)

            if attempts >= MAX_FAILED_ATTEMPTS:
                redis_client.setex(_lock_key(username, client_key), LOCKOUT_SECONDS, "1")
                redis_client.delete(failed_key)
                return error_response(
                    "Akses dikunci sementara karena 3 kali gagal login",
                    429
                )

            return error_response("Captcha kadaluarsa atau tidak valid", 401)

        if _hash_captcha(captcha_input) != captcha_hash:
            failed_key = _failed_key(username, client_key)
            attempts = redis_client.incr(failed_key)
            if attempts == 1:
                redis_client.expire(failed_key, LOCKOUT_SECONDS)

            redis_client.delete(_captcha_key(challenge_id))

            if attempts >= MAX_FAILED_ATTEMPTS:
                redis_client.setex(_lock_key(username, client_key), LOCKOUT_SECONDS, "1")
                redis_client.delete(failed_key)
                return error_response(
                    "Akses dikunci sementara karena 3 kali gagal login",
                    429
                )

            return error_response("Captcha salah", 401)

        redis_client.delete(_captcha_key(challenge_id))

        expected_username = current_app.config.get("ADMIN_USERNAME", "admin")
        expected_password_hash = current_app.config.get("ADMIN_PASSWORD_HASH", "")

        if not expected_password_hash:
            return error_response("ADMIN_PASSWORD_HASH belum dikonfigurasi", 500)

        if username != expected_username or not check_password_hash(expected_password_hash, password):
            failed_key = _failed_key(username, client_key)
            attempts = redis_client.incr(failed_key)
            if attempts == 1:
                redis_client.expire(failed_key, LOCKOUT_SECONDS)

            if attempts >= MAX_FAILED_ATTEMPTS:
                redis_client.setex(_lock_key(username, client_key), LOCKOUT_SECONDS, "1")
                redis_client.delete(failed_key)
                return error_response(
                    "Akses dikunci sementara karena 3 kali gagal login",
                    429
                )

            return error_response("Username atau password salah", 401)

        redis_client.delete(_failed_key(username, client_key))
        redis_client.delete(_lock_key(username, client_key))

        access_token = create_access_token(
            identity=username,
            additional_claims={
                "role": "admin",
                "iss": "smartdoor",
                "sub": username,
                "login_at": datetime.utcnow().isoformat() + "Z",
            },
            fresh=True,
            expires_delta=timedelta(minutes=15),
        )

        return success_response({
            "access_token": access_token,
            "user": {
                "username": username,
                "role": "admin"
            }
        }, "Login berhasil", 200)

    except Exception as exc:
        return error_response(str(exc), 500)


@auth_bp.get("/me")
@require_api_key
@jwt_required()
def me():
    try:
        return success_response({
            "username": get_jwt_identity(),
            "role": "admin"
        }, "Profile loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@auth_bp.post("/logout")
@require_api_key
def logout():
    return success_response(None, "Logout berhasil", 200)