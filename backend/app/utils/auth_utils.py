from functools import wraps
from flask import current_app, request
from flask_jwt_extended import get_jwt, jwt_required

from app.utils.response import error_response


def _get_client_api_key():
    return request.headers.get("X-API-Key") or request.args.get("api_key", "")


def require_api_key(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        expected_key = current_app.config.get("API_KEY", "")
        provided_key = _get_client_api_key()

        if expected_key and provided_key != expected_key:
            return error_response("API key tidak valid", 401)

        return fn(*args, **kwargs)

    wrapper.__name__ = fn.__name__
    return wrapper


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return error_response("Akses admin diperlukan", 403)

        return fn(*args, **kwargs)

    wrapper.__name__ = fn.__name__
    return wrapper