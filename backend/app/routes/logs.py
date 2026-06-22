from flask import Blueprint, request
from sqlalchemy import desc

from app.models.access_log import AccessLog
from app.models.register_log import RegisterLog
from app.models.spoofing_log import SpoofingLog
from app.extensions import db
from app.utils.response import success_response, error_response

logs_bp = Blueprint("logs", __name__)


def _map_access_log(row):
    return {
        "id": row.id,
        "namaUser": row.nama_user,
        "waktuAkses": row.waktu_akses.isoformat() if row.waktu_akses else None,
        "keterangan": row.keterangan,
        "status": row.status,
    }


def _map_register_log(row):
    return {
        "id": row.id,
        "namaUser": row.name,
        "userId": row.user_id,
        "status": row.status,
        "yawData": row.yaw_data,
        "pitchData": row.pitch_data,
        "rollData": row.roll_data,
        "blinkData": row.blink_data,
        "lightCondition": row.light_condition,
        "regLatencyMs": row.reg_latency_ms,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }


def _map_spoofing_log(row):
    return {
        "id": row.id,
        "spoofScore": row.spoof_score,
        "spoofType": row.spoof_type,
        "spoofLatencyMs": row.spoof_latency_ms,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }


@logs_bp.get("/akses-pintu")
def get_access_logs():
    try:
        limit = request.args.get("limit", 100, type=int)

        rows = (
            db.session.query(AccessLog)
            .order_by(desc(AccessLog.waktu_akses))
            .limit(limit)
            .all()
        )

        data = [_map_access_log(row) for row in rows]
        return success_response(data, "Log akses pintu loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@logs_bp.get("/register")
def get_register_logs():
    try:
        limit = request.args.get("limit", 100, type=int)

        rows = (
            db.session.query(RegisterLog)
            .order_by(desc(RegisterLog.created_at))
            .limit(limit)
            .all()
        )

        data = [_map_register_log(row) for row in rows]
        return success_response(data, "Register logs loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@logs_bp.get("/spoofing")
def get_spoofing_logs():
    try:
        limit = request.args.get("limit", 100, type=int)

        rows = (
            db.session.query(SpoofingLog)
            .order_by(desc(SpoofingLog.created_at))
            .limit(limit)
            .all()
        )

        data = [_map_spoofing_log(row) for row in rows]
        return success_response(data, "Spoofing logs loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@logs_bp.get("/dashboard-summary")
def dashboard_summary():
    try:
        total_access_logs = db.session.query(AccessLog).count()
        total_register_logs = db.session.query(RegisterLog).count()
        total_spoofing_logs = db.session.query(SpoofingLog).count()

        summary = {
            "total_access_logs": total_access_logs,
            "total_register_logs": total_register_logs,
            "total_spoofing_logs": total_spoofing_logs,
        }

        return success_response(summary, "Dashboard summary loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)