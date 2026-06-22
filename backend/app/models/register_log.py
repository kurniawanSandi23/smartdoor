# models/register_log.py
from datetime import datetime
from app.extensions import db

class RegisterLog(db.Model):
    __tablename__ = "register_logs"

    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    user_id = db.Column(db.String, nullable=True)
    status = db.Column(db.String, nullable=False)
    yaw_data = db.Column(db.Text, nullable=True)
    pitch_data = db.Column(db.Text, nullable=True)
    roll_data = db.Column(db.Text, nullable=True)
    blink_data = db.Column(db.Text, nullable=True)
    light_condition = db.Column(db.String, nullable=True)
    reg_latency_ms = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)