# models/access_log.py
from datetime import datetime
from app.extensions import db


class AccessLog(db.Model):
    __tablename__ = "access_logs"

    id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255), nullable=True)
    user_id = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), nullable=False)
    face_val_latency_ms = db.Column(db.Float, nullable=True)
    headpose_data = db.Column(db.Text, nullable=True)
    blink_data = db.Column(db.Text, nullable=True)
    accuracy = db.Column(db.Float, nullable=True)
    light_condition = db.Column(db.String(255), nullable=True)
    auth_latency_ms = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=True, default=datetime.utcnow)

    @property
    def nama_user(self):
        return self.name

    @nama_user.setter
    def nama_user(self, value):
        self.name = value

    @property
    def waktu_akses(self):
        return self.created_at

    @waktu_akses.setter
    def waktu_akses(self, value):
        self.created_at = value

    @property
    def keterangan(self):
        return self.light_condition

    @keterangan.setter
    def keterangan(self, value):
        self.light_condition = value

    def to_dict(self):
        return {
            "id": self.id,
            "namaUser": self.name,
            "waktuAkses": self.created_at.isoformat() if self.created_at else None,
            "keterangan": self.light_condition,
            "status": self.status,
        }