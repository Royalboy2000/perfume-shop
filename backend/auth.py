from flask import Blueprint, request, jsonify
from models import User
from flask_jwt_extended import create_access_token
from db import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400

    username = data.get('username', None)
    password = data.get('password', None)

    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=username, additional_claims={'role': user.role})
        return jsonify(access_token=access_token)

    return jsonify({"msg": "Bad username or password"}), 401
