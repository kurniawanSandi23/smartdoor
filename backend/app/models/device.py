from datetime import datetime
from app.extensions import db


class Device(db.Model):
    __tablename__ = "devices"

    id = db.Column(db.String, primary_key=True)
    device_name = db.Column(db.String, nullable=False)
    device_type = db.Column(db.String, nullable=False, default="raspberry_pi")
    ip_address = db.Column(db.String, nullable=True)
    location = db.Column(db.String, nullable=True)
    status = db.Column(db.String, nullable=False, default="offline")
    last_seen_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)