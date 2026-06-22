# models/spoofing_log.py
from datetime import datetime
from app.extensions import db

class SpoofingLog(db.Model):
    __tablename__ = "spoofing_logs"

    id = db.Column(db.String, primary_key=True)
    spoof_score = db.Column(db.Float, nullable=False)
    spoof_type = db.Column(db.String, nullable=False)
    spoof_latency_ms = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)