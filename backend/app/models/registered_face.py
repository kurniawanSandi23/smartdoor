# models/registered_face.py
from datetime import datetime
from app.extensions import db

class RegisteredFace(db.Model):
    __tablename__ = "registered_faces"

    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    embedding = db.Column(db.JSON, nullable=False)
    liveness_config = db.Column(db.JSON, nullable=True)
    reg_latency_ms = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)