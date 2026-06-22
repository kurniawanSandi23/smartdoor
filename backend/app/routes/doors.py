from datetime import datetime
from flask import Blueprint, request
from app.services.supabase_service import SupabaseService
from app.utils.response import success_response, error_response

doors_bp = Blueprint("doors", __name__)
supabase = SupabaseService()


@doors_bp.post("/<device_id>/unlock")
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


@doors_bp.post("/<device_id>/trigger-register")
def trigger_register(device_id):
    try:
        data = request.get_json(silent=True) or {}

        command_payload = {
            "id": data.get("id"),
            "device_id": device_id,
            "command_type": "trigger_register",
            "payload": {
                "name": data.get("name"),
                "source": data.get("source", "web"),
            },
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
        }

        if not command_payload["id"] or not command_payload["payload"]["name"]:
            return error_response("id dan name wajib diisi", 400)

        query = supabase.table("command_queue").insert(command_payload).execute()
        return success_response(query.data or command_payload, "Register trigger queued", 201)
    except Exception as exc:
        return error_response(str(exc), 500)


@doors_bp.get("/<device_id>/status")
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
def get_door_events(device_id):
    try:
        limit = request.args.get("limit", 100, type=int)
        query = supabase.table("door_events").select("*").eq("device_id", device_id).order("created_at", desc=True).limit(limit).execute()
        return success_response(query.data or [], "Door events loaded")
    except Exception as exc:
        return error_response(str(exc), 500)


@doors_bp.get("/<device_id>/commands")
def get_pending_commands(device_id):
    try:
        query = supabase.table("command_queue").select("*").eq("device_id", device_id).eq("status", "pending").order("created_at", desc=True).execute()
        return success_response(query.data or [], "Pending commands loaded")
    except Exception as exc:
        return error_response(str(exc), 500)


@doors_bp.post("/commands/<command_id>/ack")
def acknowledge_command(command_id):
    try:
        data = request.get_json(silent=True) or {}

        payload = {
            "status": data.get("status", "processed"),
            "processed_at": data.get("processed_at") or datetime.utcnow().isoformat(),
        }

        query = supabase.table("command_queue").update(payload).eq("id", command_id).execute()
        return success_response(query.data or [], "Command acknowledged")
    except Exception as exc:
        return error_response(str(exc), 500)