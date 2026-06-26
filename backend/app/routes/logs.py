from flask import Blueprint, request

from app.services.supabase_service import SupabaseService
from app.utils.response import success_response, error_response

logs_bp = Blueprint("logs", __name__)
supabase = SupabaseService()


def _get_supabase_rows(table_name, limit=None, fallback_names=None):
    if not supabase.is_ready():
        return []

    candidates = [table_name] + (fallback_names or [])
    for candidate in candidates:
        try:
            query = supabase.table(candidate).select("*")
            if limit is not None:
                query = query.limit(limit)
            result = query.execute()
            rows = getattr(result, "data", None)
            if rows is not None:
                return rows
        except Exception:
            continue

    return []


def _coerce_timestamp(row):
    if not isinstance(row, dict):
        return ""

    for key in ("created_at", "createdAt", "timestamp", "waktuAkses", "waktu_akses"):
        value = row.get(key)
        if value:
            return str(value)

    return ""


def _map_access_log(row):
    if isinstance(row, dict):
        return {
            "id": row.get("id"),
            "namaUser": row.get("name") or row.get("nama_user") or row.get("namaUser") or row.get("user_name"),
            "waktuAkses": row.get("created_at") or row.get("waktuAkses") or row.get("waktu_akses") or row.get("timestamp"),
            "keterangan": row.get("keterangan") or row.get("light_condition") or row.get("notes"),
            "status": row.get("status"),
        }

    return {
        "id": row.id,
        "namaUser": row.nama_user,
        "waktuAkses": row.waktu_akses.isoformat() if row.waktu_akses else None,
        "keterangan": row.keterangan,
        "status": row.status,
    }


def _map_register_log(row):
    if isinstance(row, dict):
        return {
            "id": row.get("id"),
            "namaUser": row.get("name") or row.get("namaUser"),
            "userId": row.get("user_id") or row.get("userId"),
            "status": row.get("status"),
            "yawData": row.get("yaw_data") or row.get("yawData"),
            "pitchData": row.get("pitch_data") or row.get("pitchData"),
            "rollData": row.get("roll_data") or row.get("rollData"),
            "blinkData": row.get("blink_data") or row.get("blinkData"),
            "lightCondition": row.get("light_condition") or row.get("lightCondition"),
            "regLatencyMs": row.get("reg_latency_ms") or row.get("regLatencyMs"),
            "createdAt": row.get("created_at") or row.get("createdAt"),
        }

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
    if isinstance(row, dict):
        return {
            "id": row.get("id"),
            "spoofScore": row.get("spoof_score") or row.get("spoofScore") or row.get("score"),
            "spoofType": row.get("spoof_type") or row.get("spoofType") or row.get("type"),
            "spoofLatencyMs": row.get("spoof_latency_ms") or row.get("spoofLatencyMs"),
            "createdAt": row.get("created_at") or row.get("createdAt") or row.get("timestamp"),
        }

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
        rows = _get_supabase_rows("access_logs", limit=limit)
        rows = sorted(rows, key=lambda item: _coerce_timestamp(item), reverse=True)
        data = [_map_access_log(row) for row in rows]
        return success_response(data, "Log akses pintu loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@logs_bp.get("/register")
def get_register_logs():
    try:
        limit = request.args.get("limit", 100, type=int)
        rows = _get_supabase_rows("register_logs", limit=limit)
        rows = sorted(rows, key=lambda item: _coerce_timestamp(item), reverse=True)
        data = [_map_register_log(row) for row in rows]
        return success_response(data, "Register logs loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@logs_bp.get("/spoofing")
def get_spoofing_logs():
    try:
        limit = request.args.get("limit", 10, type=int)
        rows = _get_supabase_rows("spoofing_logs", limit=limit, fallback_names=["spoofing_log"])
        rows = sorted(rows, key=lambda item: _coerce_timestamp(item), reverse=True)
        data = [_map_spoofing_log(row) for row in rows]
        return success_response(data, "Spoofing logs loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@logs_bp.get("/dashboard-summary")
def dashboard_summary():
    try:
        access_rows = _get_supabase_rows("access_logs")
        register_rows = _get_supabase_rows("register_logs")
        spoofing_rows = _get_supabase_rows("spoofing_logs", fallback_names=["spoofing_log"])

        summary = {
            "total_access_logs": len(access_rows),
            "total_register_logs": len(register_rows),
            "total_spoofing_logs": len(spoofing_rows),
        }

        return success_response(summary, "Dashboard summary loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)