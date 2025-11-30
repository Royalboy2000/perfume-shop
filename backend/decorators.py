from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt

def owner_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get('role') == 'owner':
                return fn(*args, **kwargs)
            else:
                return jsonify(msg='Owners only!'), 403
        return decorator
    return wrapper
