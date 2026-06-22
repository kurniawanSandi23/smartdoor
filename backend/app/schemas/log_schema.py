def normalize_access_log_payload(data):
    return {
        "id": data.get("id"),
        "name": data.get("name"),
        "user_id": data.get("user_id"),
        "status": data.get("status"),
        "face_val_latency_ms": data.get("face_val_latency_ms"),
        "headpose_data": data.get("headpose_data"),
        "blink_data": data.get("blink_data"),
        "accuracy": data.get("accuracy"),
        "light_condition": data.get("light_condition"),
        "auth_latency_ms": data.get("auth_latency_ms"),
        "created_at": data.get("created_at"),
    }


def normalize_register_log_payload(data):
    return {
        "id": data.get("id"),
        "name": data.get("name"),
        "user_id": data.get("user_id"),
        "status": data.get("status"),
        "yaw_data": data.get("yaw_data"),
        "pitch_data": data.get("pitch_data"),
        "roll_data": data.get("roll_data"),
        "blink_data": data.get("blink_data"),
        "light_condition": data.get("light_condition"),
        "reg_latency_ms": data.get("reg_latency_ms"),
        "created_at": data.get("created_at"),
    }


def normalize_spoofing_log_payload(data):
    return {
        "id": data.get("id"),
        "spoof_score": data.get("spoof_score"),
        "spoof_type": data.get("spoof_type"),
        "spoof_latency_ms": data.get("spoof_latency_ms"),
        "created_at": data.get("created_at"),
    }