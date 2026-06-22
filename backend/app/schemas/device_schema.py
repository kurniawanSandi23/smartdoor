def validate_device_payload(data):
    errors = []

    if not data.get("id"):
        errors.append("id wajib diisi")
    if not data.get("device_name"):
        errors.append("device_name wajib diisi")

    return len(errors) == 0, errors


def normalize_device_payload(data):
    return {
        "id": data.get("id"),
        "device_name": data.get("device_name"),
        "device_type": data.get("device_type", "raspberry_pi"),
        "ip_address": data.get("ip_address"),
        "location": data.get("location"),
        "status": data.get("status", "offline"),
        "last_seen_at": data.get("last_seen_at"),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }