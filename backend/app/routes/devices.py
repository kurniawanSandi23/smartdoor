from flask import Blueprint, request
from app.services.supabase_service import SupabaseService
from app.utils.response import success_response, error_response
from datetime import datetime

devices_bp = Blueprint("devices", __name__)
supabase = SupabaseService()


@devices_bp.get("/")
def list_devices():
    try:
        query = supabase.table("devices").select("*").order("created_at", desc=True).execute()
        return success_response(query.data or [], "Devices loaded")
    except Exception as exc:
        return error_response(str(exc), 500)


@devices_bp.post("/register")
def register_device():
    try:
        data = request.get_json(silent=True) or {}

        payload = {
            "id": data.get("id"),
            "device_name": data.get("device_name"),
            "device_type": data.get("device_type", "raspberry_pi"),
            "ip_address": data.get("ip_address"),
            "location": data.get("location"),
            "status": data.get("status", "offline"),
            "last_seen_at": data.get("last_seen_at"),
            "created_at": data.get("created_at") or datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        if not payload["id"] or not payload["device_name"]:
            return error_response("id dan device_name wajib diisi", 400)

        query = supabase.table("devices").upsert(payload, on_conflict="id").execute()
        return success_response(query.data or payload, "Device registered", 201)
    except Exception as exc:
        return error_response(str(exc), 500)


@devices_bp.get("/<device_id>")
def get_device(device_id):
    try:
        query = supabase.table("devices").select("*").eq("id", device_id).limit(1).execute()
        data = query.data[0] if query.data else None

        if not data:
            return error_response("Device tidak ditemukan", 404)

        return success_response(data, "Device loaded")
    except Exception as exc:
        return error_response(str(exc), 500)


@devices_bp.patch("/<device_id>")
def update_device(device_id):
    try:
        data = request.get_json(silent=True) or {}

        payload = {
            "device_name": data.get("device_name"),
            "device_type": data.get("device_type"),
            "ip_address": data.get("ip_address"),
            "location": data.get("location"),
            "status": data.get("status"),
            "last_seen_at": data.get("last_seen_at"),
            "updated_at": datetime.utcnow().isoformat(),
        }

        payload = {key: value for key, value in payload.items() if value is not None}

        if not payload:
            return error_response("Tidak ada data yang diupdate", 400)

        query = supabase.table("devices").update(payload).eq("id", device_id).execute()
        return success_response(query.data or [], "Device updated")
    except Exception as exc:
        return error_response(str(exc), 500)


@devices_bp.get("/<device_id>/health")
def device_health(device_id):
    try:
        query = supabase.table("devices").select("id, device_name, status, last_seen_at, ip_address").eq("id", device_id).limit(1).execute()
        data = query.data[0] if query.data else None

        if not data:
            return error_response("Device tidak ditemukan", 404)

        return success_response({
            "device_id": data["id"],
            "device_name": data.get("device_name"),
            "status": data.get("status"),
            "ip_address": data.get("ip_address"),
            "last_seen_at": data.get("last_seen_at"),
        }, "Device health loaded")
    except Exception as exc:
        return error_response(str(exc), 500)


@devices_bp.post("/<device_id>/heartbeat")
def heartbeat(device_id):
    try:
        data = request.get_json(silent=True) or {}

        payload = {
            "status": data.get("status", "online"),
            "last_seen_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        if "ip_address" in data:
            payload["ip_address"] = data["ip_address"]

        query = supabase.table("devices").update(payload).eq("id", device_id).execute()
        return success_response(query.data or [], "Heartbeat received")
    except Exception as exc:
        return error_response(str(exc), 500)