from flask import Blueprint, request, jsonify
from models import Sale, User, Inventory, Product
from db import db
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
from datetime import datetime

employee_bp = Blueprint('employee', __name__)

@employee_bp.route('/sales', methods=['GET'])
@jwt_required()
def get_sales():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    query = Sale.query.filter_by(employee_id=user.id).options(db.joinedload(Sale.product))

    date_from = request.args.get('date_from')
    if date_from:
        query = query.filter(Sale.time >= date_from)

    date_to = request.args.get('date_to')
    if date_to:
        query = query.filter(Sale.time <= date_to)

    product_name = request.args.get('product_name')
    if product_name:
        query = query.join(Product).filter(Product.name.ilike(f'%{product_name}%'))

    sales = query.all()
    return jsonify([{
        'id': sale.id,
        'ticket_id': sale.ticket_id,
        'time': sale.time,
        'product_id': sale.product_id,
        'quantity': sale.quantity,
        'total': sale.total,
        'notes': sale.notes,
        'product': {
            'name': sale.product.name
        }
    } for sale in sales])

@employee_bp.route('/sales', methods=['POST'])
@jwt_required()
def create_sale():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400

    items = data.get('items')
    if not items:
        return jsonify({"msg": "Missing items in request"}), 400

    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()

    ticket_id = f"#T-{uuid.uuid4().hex[:6].upper()}"

    # Determine the sale timestamp. If the client sent a `time` value in the
    # request JSON, try to parse it as an ISO 8601 string. If parsing fails
    # (e.g. invalid format) or if no time is provided, fallback to the current
    # UTC time. This prevents a NameError when constructing the Sale model and
    # ensures the `time` column (which is not nullable) always gets a value.
    sale_time_str = data.get("time")
    if sale_time_str:
        try:
            sale_time = datetime.fromisoformat(sale_time_str)
        except (ValueError, TypeError):
            sale_time = datetime.utcnow()
    else:
        sale_time = datetime.utcnow()

    try:
        with db.session.begin_nested():
            # Loop through each item in the sale and create a Sale record.
            for item in items:
                # Cast the product_id to an integer to match the primary key on the
                # Product model. If the value cannot be converted, return a 400.
                try:
                    product_id = int(item["product_id"])
                except (TypeError, ValueError):
                    return jsonify({"msg": f"Invalid product_id {item['product_id']}"}), 400

                product = Product.query.get(product_id)
                if not product:
                    return jsonify({"msg": f"Product with id {item['product_id']} not found"}), 404

                total = product.selling_price * item["quantity"]

                new_sale = Sale(
                    ticket_id=ticket_id,
                    time=sale_time,
                    product_id=product_id,
                    quantity=item["quantity"],
                    total=total,
                    notes=item.get('notes'),
                    employee_id=user.id
                )
                db.session.add(new_sale)
        db.session.commit()
        return jsonify({'message': 'Sale created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        # It's good practice to log the exception here
        # logger.error(f"Error creating sale: {e}")
        return jsonify({"msg": "An internal error occurred"}), 500

@employee_bp.route('/stock', methods=['GET'])
@jwt_required()
def get_stock():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    inventory = Inventory.query.filter_by(shop_id=user.shop_id).all()
    return jsonify([{
        'id': item.id,
        'product_id': item.product_id,
        'product_name': item.product.name,
        'current_stock': item.current_stock,
        'reorder_level': item.product.reorder_level
    } for item in inventory])

@employee_bp.route('/stock-in', methods=['POST'])
@jwt_required()
def stock_in():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400

    product_id = data.get('product_id')
    quantity = data.get('quantity')

    if not all([product_id, quantity]):
        return jsonify({"msg": "Missing required fields"}), 400

    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()

    inventory_item = Inventory.query.filter_by(shop_id=user.shop_id, product_id=product_id).first()

    if inventory_item:
        inventory_item.current_stock += quantity
    else:
        inventory_item = Inventory(
            shop_id=user.shop_id,
            product_id=product_id,
            current_stock=quantity
        )
        db.session.add(inventory_item)

    db.session.commit()
    return jsonify({'message': 'Stock added successfully'}), 201

@employee_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()

    total_sales = db.session.query(db.func.sum(Sale.total)).filter_by(employee_id=user.id).scalar()
    low_stock_count = db.session.query(Inventory).join(Product).filter(Inventory.shop_id == user.shop_id, Inventory.current_stock <= Product.reorder_level).count()

    return jsonify({
        'total_sales': total_sales,
        'low_stock_count': low_stock_count
    })
