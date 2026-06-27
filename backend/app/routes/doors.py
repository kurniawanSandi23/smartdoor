from datetime import datetime
from flask import Blueprint, request
from app.services.supabase_service import SupabaseService
from app.utils.response import success_response, error_response
from app.utils.auth_utils import admin_required, require_api_key

doors_bp = Blueprint("doors", __name__)
supabase = SupabaseService()


@doors_bp.post("/<device_id>/unlock")
@require_api_key
@admin_required
def unlock_door(device_id):
    try:
        data = request.get_json(silent=True) or {}

        payload = {
            "id": data.get("id"),
            "device_id": device_id,
            "event_type": "unlock",
            "event_status": "success",
            "payload": data.get("payload", {}),
            "created_at": datetime.utcnow().isoformat(),
        }

        if not payload["id"]:
            return error_response("id command wajib diisi", 400)

        query = supabase.table("door_events").insert(payload).execute()
        return success_response(query.data or payload, "Unlock command queued", 201)
    except Exception as exc:
        return error_response(str(exc), 500)


@doors_bp.post("/<device_id>/lock")
@require_api_key
@admin_required
def lock_door(device_id):
    try:
        data = request.get_json(silent=True) or {}

        payload = {
            "id": data.get("id"),
            "device_id": device_id,
            "event_type": "lock",
            "event_status": "success",
            "payload": data.get("payload", {}),
            "created_at": datetime.utcnow().isoformat(),
        }

        if not payload["id"]:
            return error_response("id command wajib diisi", 400)

        query = supabase.table("door_events").insert(payload).execute()
        return success_response(query.data or payload, "Lock command queued", 201)
    except Exception as exc:
        return error_response(str(exc), 500)


@doors_bp.get("/<device_id>/status")
@require_api_key
def get_door_status(device_id):
    try:
        query = supabase.table("door_events").select("*").eq("device_id", device_id).order("created_at", desc=True).limit(1).execute()
        data = query.data[0] if query.data else None

        if not data:
            return success_response({
                "device_id": device_id,
                "status": "unknown"
            }, "Door status loaded")

        return success_response(data, "Door status loaded")
    except Exception as exc:
        return error_response(str(exc), 500)


@doors_bp.get("/<device_id>/events")
@require_api_key
def get_door_events(device_id):
    try:
        limit = request.args.get("limit", 100, type=int)
        query = supabase.table("door_events").select("*").eq("device_id", device_id).order("created_at", desc=True).limit(limit).execute()
        return success_response(query.data or [], "Door events loaded")
    except Exception as exc:
        return error_response(str(exc), 500)
