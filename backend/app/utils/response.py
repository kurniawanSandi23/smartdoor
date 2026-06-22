from flask import jsonify


def success_response(data=None, message="OK", status_code=200):
    return jsonify({
        "status": "success",
        "message": message,
        "data": data
    }), status_code


def error_response(message="Terjadi kesalahan", status_code=400, data=None):
    return jsonify({
        "status": "error",
        "message": message,
        "data": data
    }), status_code