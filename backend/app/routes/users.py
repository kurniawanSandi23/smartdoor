import requests
from datetime import datetime, timezone
from flask import Blueprint, current_app, request

from app.extensions import db
from app.models.access_log import AccessLog
from app.models.user import User
from app.models.registered_face import RegisteredFace
from app.utils.response import success_response, error_response

user_bp = Blueprint("user", __name__)


def _map_user(row):
    return {
        "id": row.id,
        "fullName": row.full_name,
        "email": row.email,
        "role": row.role,
        "isActive": row.is_active,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
        "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
    }


def _map_registered_face(row):
    return {
        "id": row.id,
        "name": row.name,
        "embedding": row.embedding,
        "livenessConfig": row.liveness_config,
        "regLatencyMs": row.reg_latency_ms,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }


@user_bp.get("/profiles")
def get_profiles():
    try:
        rows = db.session.query(User).order_by(User.created_at.desc()).all()
        data = [_map_user(row) for row in rows]
        return success_response(data, "Profiles loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@user_bp.get("/registered-faces")
def get_registered_faces():
    try:
        rows = db.session.query(RegisteredFace).order_by(RegisteredFace.created_at.desc()).all()
        data = [_map_registered_face(row) for row in rows]
        return success_response(data, "Registered faces loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@user_bp.post("/register-face")
def register_face():
    try:
        data = request.get_json(silent=True) or {}
        nama_user = str(data.get("namaUser", "")).strip()

        if not nama_user:
            return error_response("namaUser wajib diisi", 400)

        edge_base_url = current_app.config.get("EDGE_BASE_URL", "").rstrip("/")
        if not edge_base_url:
            return error_response("EDGE_BASE_URL belum dikonfigurasi", 503)

        edge_response = requests.post(
            f"{edge_base_url}/api/trigger-register",
            json={"name": nama_user},
            timeout=15
        )

        try:
            edge_data = edge_response.json()
        except Exception:
            edge_data = {"message": "Edge response is not valid JSON"}

        if edge_response.status_code not in (200, 201):
            return error_response(
                edge_data.get("message", "Gagal meneruskan trigger ke Raspberry Pi"),
                edge_response.status_code
            )

        return success_response({
            "triggered": True,
            "namaUser": nama_user,
            "edgeResponse": edge_data
        }, "Trigger pendaftaran wajah terkirim", 200)

    except requests.RequestException as exc:
        return error_response(f"Gagal koneksi ke Raspberry Pi: {str(exc)}", 502)
    except Exception as exc:
        return error_response(str(exc), 500)


@user_bp.post("/access-result")
def access_result():
    try:
        data = request.get_json(silent=True) or {}

        nama_user = str(data.get("namaUser", "")).strip()
        waktu_akses = str(data.get("waktuAkses", "")).strip()
        keterangan = str(data.get("keterangan", "")).strip()
        status = str(data.get("status", "")).strip()

        if not nama_user or not waktu_akses or not keterangan or not status:
            return error_response("Payload callback tidak lengkap", 400)

        try:
            parsed_waktu = datetime.fromisoformat(waktu_akses.replace("Z", "+00:00"))
        except Exception:
            parsed_waktu = datetime.now(timezone.utc)

        new_log = AccessLog(
            nama_user=nama_user,
            waktu_akses=parsed_waktu,
            keterangan=keterangan,
            status=status,
        )

        db.session.add(new_log)
        db.session.commit()

        return success_response({
            "received": True,
            "saved": True,
            "log": new_log.to_dict()
        }, "Hasil scan berhasil disimpan", 201)

    except Exception as exc:
        db.session.rollback()
        return error_response(str(exc), 500)