from flask import Flask, make_response, request

from config import Config
from app.extensions import db, jwt, cors
from app.routes.auth import auth_bp, init_limiter
from app.utils.response import error_response


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    allowed_origins = [origin.strip() for origin in app.config["CORS_ORIGINS"].split(",") if origin.strip()]
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-API-Key"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    @jwt.unauthorized_loader
    def unauthorized_loader(_callback):
        return error_response("Token JWT diperlukan", 401)

    @jwt.invalid_token_loader
    def invalid_token_loader(_callback):
        return error_response("Token JWT tidak valid", 401)

    @jwt.expired_token_loader
    def expired_token_loader(_jwt_header, _jwt_payload):
        return error_response("Token JWT kedaluwarsa", 401)

    init_limiter(app)

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response("")
            origin = request.headers.get("Origin")
            if origin:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-API-Key"
            return response, 200

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin")
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Vary"] = "Origin"
        return response

    with app.app_context():
        from app.routes.users import user_bp
        from app.routes.devices import devices_bp
        from app.routes.doors import doors_bp
        from app.routes.logs import logs_bp
        from app.routes.health import health_bp

        app.register_blueprint(auth_bp, url_prefix="/api/auth")
        app.register_blueprint(user_bp, url_prefix="/api/user")
        app.register_blueprint(devices_bp, url_prefix="/api/devices")
        app.register_blueprint(doors_bp, url_prefix="/api/doors")
        app.register_blueprint(logs_bp, url_prefix="/api/logs")
        app.register_blueprint(health_bp, url_prefix="/api/health")

    return app