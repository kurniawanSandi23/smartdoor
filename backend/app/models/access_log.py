# models/access_log.py
from datetime import datetime
from app.extensions import db


class AccessLog(db.Model):
    __tablename__ = "access_logs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nama_user = db.Column(db.String(150), nullable=False)
    waktu_akses = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    keterangan = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "namaUser": self.nama_user,
            "waktuAkses": self.waktu_akses.isoformat() if self.waktu_akses else None,
            "keterangan": self.keterangan,
            "status": self.status,
        }