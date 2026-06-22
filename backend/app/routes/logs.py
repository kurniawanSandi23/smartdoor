from flask import Blueprint, request
from sqlalchemy import desc

from app.models.access_log import AccessLog
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


@logs_bp.get("/dashboard-summary")
def dashboard_summary():
    try:
        total_access_logs = db.session.query(AccessLog).count()

        summary = {
            "total_access_logs": total_access_logs
        }

        return success_response(summary, "Dashboard summary loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)