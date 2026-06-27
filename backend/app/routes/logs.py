from flask import Blueprint, request

from app.services.supabase_service import SupabaseService
from app.utils.auth_utils import admin_required
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


@logs_bp.get("/akses-pintu")
@admin_required
def get_access_logs():
    try:
        limit = request.args.get("limit", 100, type=int)
        rows = _get_supabase_rows("access_logs", limit=limit)
        rows = sorted(rows, key=lambda item: str(item.get("created_at") or ""), reverse=True)
        return success_response(rows, "Log akses pintu loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@logs_bp.get("/register")
@admin_required
def get_register_logs():
    try:
        limit = request.args.get("limit", 100, type=int)
        rows = _get_supabase_rows("register_logs", limit=limit)
        return success_response(rows, "Register logs loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@logs_bp.get("/spoofing")
@admin_required
def get_spoofing_logs():
    try:
        limit = request.args.get("limit", 10, type=int)
        rows = _get_supabase_rows("spoofing_logs", limit=limit, fallback_names=["spoofing_log"])
        return success_response(rows, "Spoofing logs loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@logs_bp.get("/dashboard-summary")
@admin_required
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