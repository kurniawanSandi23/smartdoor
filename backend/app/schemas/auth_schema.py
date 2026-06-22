def validate_login_payload(data):
    errors = []

    email = data.get("email")
    password = data.get("password")

    if not email:
        errors.append("email wajib diisi")
    if not password:
        errors.append("password wajib diisi")

    return len(errors) == 0, errors


def login_response_schema(access_token, user):
    return {
        "access_token": access_token,
        "user": user
    }