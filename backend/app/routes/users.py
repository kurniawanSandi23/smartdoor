import requests
from datetime import datetime, timezone
from flask import Blueprint, current_app, request

from app.services.supabase_service import SupabaseService
from app.utils.response import success_response, error_response
from app.utils.auth_utils import admin_required, require_api_key

user_bp = Blueprint("user", __name__)
supabase = SupabaseService()


def _get_supabase_rows(table_name):
    if not supabase.is_ready():
        return None

    query = supabase.table(table_name).select("*").execute()
    return query.data or []


def _map_user(row):
    if isinstance(row, dict):
        return {
            "id": row.get("id"),
            "fullName": row.get("full_name") or row.get("fullName"),
            "email": row.get("email"),
            "role": row.get("role"),
            "isActive": row.get("is_active") if "is_active" in row else row.get("isActive"),
            "createdAt": row.get("created_at") or row.get("createdAt"),
            "updatedAt": row.get("updated_at") or row.get("updatedAt"),
        }

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
    if isinstance(row, dict):
        return {
            "id": row.get("id"),
            "name": row.get("name"),
            "embedding": row.get("embedding"),
            "livenessConfig": row.get("liveness_config") or row.get("livenessConfig"),
            "regLatencyMs": row.get("reg_latency_ms") or row.get("regLatencyMs"),
            "createdAt": row.get("created_at") or row.get("createdAt"),
        }

    return {
        "id": row.id,
        "name": row.name,
        "embedding": row.embedding,
        "livenessConfig": row.liveness_config,
        "regLatencyMs": row.reg_latency_ms,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }


@user_bp.get("/profiles")
@require_api_key
@admin_required
def get_profiles():
    try:
        rows = _get_supabase_rows("profiles")
        if rows is None:
            return error_response("Supabase belum dikonfigurasi", 503)

        data = [_map_user(row) for row in rows]
        return success_response(data, "Profiles loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@user_bp.get("/registered-faces")
@require_api_key
@admin_required
def get_registered_faces():
    try:
        rows = _get_supabase_rows("registered_faces")
        if rows is None:
            return error_response("Supabase belum dikonfigurasi", 503)

        data = [_map_registered_face(row) for row in rows]
        return success_response(data, "Registered faces loaded", 200)
    except Exception as exc:
        return error_response(str(exc), 500)


@user_bp.post("/register-face")
@require_api_key
@admin_required
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
@require_api_key
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

        if not supabase.is_ready():
            return error_response("Supabase belum siap untuk menyimpan log akses", 503)

        payload = {
            "name": nama_user,
            "status": status,
            "created_at": parsed_waktu.isoformat(),
            "light_condition": keterangan,
        }

        try:
            supabase.table("access_logs").insert(payload).execute()
        except Exception as exc:
            return error_response(f"Gagal menyimpan log akses: {str(exc)}", 500)

        return success_response({
            "received": True,
            "saved": True,
            "log": {
                "namaUser": nama_user,
                "waktuAkses": parsed_waktu.isoformat(),
                "keterangan": keterangan,
                "status": status,
            }
        }, "Hasil scan berhasil disimpan", 201)

    except Exception as exc:
        return error_response(str(exc), 500)