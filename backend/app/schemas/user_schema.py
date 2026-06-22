def validate_user_payload(data):
    errors = []

    if not data.get("id"):
        errors.append("id wajib diisi")
    if not data.get("full_name"):
        errors.append("full_name wajib diisi")

    return len(errors) == 0, errors


def normalize_user_payload(data):
    return {
        "id": data.get("id"),
        "full_name": data.get("full_name"),
        "email": data.get("email"),
        "role": data.get("role", "user"),
        "is_active": data.get("is_active", True),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }


def validate_face_payload(data):
    errors = []

    if not data.get("id"):
        errors.append("id wajib diisi")
    if not data.get("embedding"):
        errors.append("embedding wajib diisi")

    return len(errors) == 0, errors