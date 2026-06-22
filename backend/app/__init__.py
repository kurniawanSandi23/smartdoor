from flask import Flask

from config import Config
from app.extensions import db, jwt, cors
from app.routes.auth import auth_bp, init_limiter


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    init_limiter(app)

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