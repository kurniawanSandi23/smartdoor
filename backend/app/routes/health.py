from flask import Blueprint
from app.services.supabase_service import SupabaseService
from app.utils.response import success_response, error_response

health_bp = Blueprint("health", __name__)
supabase = SupabaseService()


@health_bp.get("/")
def health_check():
    return success_response({
        "service": "smartdoor-backend",
        "status": "running"
    }, "Backend is healthy")


@health_bp.get("/supabase")
def health_supabase():
    try:
        if not supabase.is_ready():
            return error_response("Supabase belum dikonfigurasi", 503)

        query = supabase.table("profiles").select("id", count="exact").limit(1).execute()
        return success_response({
            "supabase_connected": True,
            "sample_query_ok": True,
            "profiles_count_check": query.count if hasattr(query, "count") else None
        }, "Supabase is healthy")
    except Exception as exc:
        return error_response(str(exc), 503)


@health_bp.get("/database")
def health_database():
    try:
        if not supabase.is_ready():
            return error_response("Supabase belum dikonfigurasi", 503)

        tables = ["profiles", "devices", "registered_faces", "register_logs", "access_logs", "spoofing_logs"]
        result = {}

        for table_name in tables:
            query = supabase.table(table_name).select("id", count="exact").limit(1).execute()
            result[table_name] = {
                "ok": True,
                "count_check": query.count if hasattr(query, "count") else None
            }

        return success_response(result, "Database is healthy")
    except Exception as exc:
        return error_response(str(exc), 503)