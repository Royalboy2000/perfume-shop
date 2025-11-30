from flask import Blueprint, jsonify
from models import Product
from db import db
from flask_jwt_extended import jwt_required

api_bp = Blueprint('api', __name__)

@api_bp.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': product.id,
        'product_id': product.product_id,
        'name': product.name,
        'category': product.category,
        'cost_price': product.cost_price,
        'selling_price': product.selling_price,
        'reorder_level': product.reorder_level
    } for product in products])
