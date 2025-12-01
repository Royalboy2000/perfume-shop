from flask import Blueprint, request, jsonify
from models import User, Shop, Product, Inventory, Sale, StockIn
from db import db
from flask_jwt_extended import jwt_required
from decorators import owner_required
from email_validator import validate_email, EmailNotValidError

owner_bp = Blueprint('owner', __name__)

@owner_bp.route('/employees', methods=['GET'])
@jwt_required()
@owner_required()
def get_employees():
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'employee_id': user.employee_id,
        'name': user.name,
        'shop_id': user.shop_id,
        'role': user.role,
        'contact': user.contact,
        'username': user.username
    } for user in users])

@owner_bp.route('/employees', methods=['POST'])
@jwt_required()
@owner_required()
def create_employee():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400

    employee_id = data.get('employee_id')
    name = data.get('name')
    shop_id = data.get('shop_id')
    role = data.get('role')
    contact = data.get('contact')
    username = data.get('username')
    password = data.get('password')

    required_fields = ['employee_id', 'name', 'role', 'username', 'password']
    if not all(data.get(field) for field in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    try:
        validate_email(username)
    except EmailNotValidError as e:
        return jsonify({"msg": str(e)}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "User with this username already exists."}), 400

    new_user = User(
        employee_id=employee_id,
        name=name,
        shop_id=shop_id,
        role=role,
        contact=contact,
        username=username
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Employee created successfully'}), 201

@owner_bp.route('/employees/<int:id>', methods=['PUT'])
@jwt_required()
@owner_required()
def update_employee(id):
    data = request.get_json()
    user = User.query.get(id)
    if not user:
        return jsonify({'message': 'Employee not found'}), 404

    user.employee_id = data.get('employee_id', user.employee_id)
    user.name = data.get('name', user.name)
    user.shop_id = data.get('shop_id', user.shop_id)
    user.role = data.get('role', user.role)
    user.contact = data.get('contact', user.contact)
    user.username = data.get('username', user.username)

    if 'password' in data:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify({'message': 'Employee updated successfully'})

@owner_bp.route('/employees/<int:id>', methods=['DELETE'])
@jwt_required()
@owner_required()
def delete_employee(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'message': 'Employee not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Employee deleted successfully'})

@owner_bp.route('/shops', methods=['GET'])
@jwt_required()
@owner_required()
def get_shops():
    shops = Shop.query.all()
    return jsonify([{
        'id': shop.id,
        'shop_id': shop.shop_id,
        'name': shop.name,
        'manager': shop.manager
    } for shop in shops])

@owner_bp.route('/shops', methods=['POST'])
@jwt_required()
@owner_required()
def create_shop():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400

    shop_id = data.get('shop_id')
    name = data.get('name')

    if not all([shop_id, name]):
        return jsonify({"msg": "Missing required fields"}), 400

    if Shop.query.filter_by(shop_id=shop_id).first():
        return jsonify({"msg": "Shop with this ID already exists."}), 400

    new_shop = Shop(
        shop_id=shop_id,
        name=name,
        manager=data.get('manager')
    )
    db.session.add(new_shop)
    db.session.commit()
    return jsonify({'message': 'Shop created successfully'}), 201

@owner_bp.route('/shops/<int:id>', methods=['PUT'])
@jwt_required()
@owner_required()
def update_shop(id):
    data = request.get_json()
    shop = Shop.query.get(id)
    if not shop:
        return jsonify({'message': 'Shop not found'}), 404

    shop.shop_id = data.get('shop_id', shop.shop_id)
    shop.name = data.get('name', shop.name)
    shop.manager = data.get('manager', shop.manager)

    db.session.commit()
    return jsonify({'message': 'Shop updated successfully'})

@owner_bp.route('/shops/<int:id>', methods=['DELETE'])
@jwt_required()
@owner_required()
def delete_shop(id):
    shop = Shop.query.get(id)
    if not shop:
        return jsonify({'message': 'Shop not found'}), 404

    db.session.delete(shop)
    db.session.commit()
    return jsonify({'message': 'Shop deleted successfully'})

@owner_bp.route('/products', methods=['GET'])
@jwt_required()
@owner_required()
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

@owner_bp.route('/products', methods=['POST'])
@jwt_required()
@owner_required()
def create_product():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400

    product_id = data.get('product_id')
    name = data.get('name')
    cost_price = data.get('cost_price')
    selling_price = data.get('selling_price')
    reorder_level = data.get('reorder_level')

    if not all([product_id, name, cost_price, selling_price, reorder_level]):
        return jsonify({"msg": "Missing required fields"}), 400

    if Product.query.filter_by(product_id=product_id).first():
        return jsonify({"msg": "Product with this ID already exists."}), 400

    new_product = Product(
        product_id=product_id,
        name=name,
        category=data.get('category'),
        cost_price=cost_price,
        selling_price=selling_price,
        reorder_level=reorder_level
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Product created successfully'}), 201

@owner_bp.route('/products/<int:id>', methods=['PUT'])
@jwt_required()
@owner_required()
def update_product(id):
    data = request.get_json()
    product = Product.query.get(id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    product.product_id = data.get('product_id', product.product_id)
    product.name = data.get('name', product.name)
    product.category = data.get('category', product.category)
    product.cost_price = data.get('cost_price', product.cost_price)
    product.selling_price = data.get('selling_price', product.selling_price)
    product.reorder_level = data.get('reorder_level', product.reorder_level)

    db.session.commit()
    return jsonify({'message': 'Product updated successfully'})

@owner_bp.route('/products/<int:id>', methods=['DELETE'])
@jwt_required()
@owner_required()
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'})

@owner_bp.route('/inventory', methods=['GET'])
@jwt_required()
@owner_required()
def get_inventory():
    query = Inventory.query.options(db.joinedload(Inventory.shop), db.joinedload(Inventory.product))

    shop_id = request.args.get('shop_id')
    if shop_id:
        query = query.filter(Inventory.shop_id == shop_id)

    view = request.args.get('view')
    if view == 'low':
        query = query.join(Product).filter(Inventory.current_stock <= Product.reorder_level)

    product_name = request.args.get('product_name')
    if product_name:
        query = query.join(Product).filter(Product.name.ilike(f'%{product_name}%'))

    inventory = query.all()
    return jsonify([{
        'id': item.id,
        'shop_id': item.shop_id,
        'product_id': item.product_id,
        'current_stock': item.current_stock,
        'shop': {
            'shop_id': item.shop.shop_id,
            'name': item.shop.name
        },
        'product': {
            'name': item.product.name,
            'reorder_level': item.product.reorder_level
        }
    } for item in inventory])

@owner_bp.route('/inventory/stock-in', methods=['POST'])
@jwt_required()
@owner_required()
def stock_in():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400

    shop_id = data.get('shop_id')
    product_id = data.get('product_id')
    quantity = data.get('quantity')

    if not all([shop_id, product_id, quantity]):
        return jsonify({"msg": "Missing required fields"}), 400

    inventory_item = Inventory.query.filter_by(shop_id=shop_id, product_id=product_id).first()

    if inventory_item:
        inventory_item.current_stock += quantity
    else:
        inventory_item = Inventory(
            shop_id=shop_id,
            product_id=product_id,
            current_stock=quantity
        )
        db.session.add(inventory_item)

    db.session.commit()
    return jsonify({'message': 'Stock added successfully'}), 201

@owner_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@owner_required()
def dashboard():
    total_sales = db.session.query(db.func.sum(Sale.total)).scalar()
    low_stock_count = db.session.query(Inventory).join(Product).filter(Inventory.current_stock <= Product.reorder_level).count()

    return jsonify({
        'total_sales': total_sales,
        'low_stock_count': low_stock_count
    })

@owner_bp.route('/sales', methods=['GET'])
@jwt_required()
@owner_required()
def get_sales():
    query = Sale.query.options(db.joinedload(Sale.employee).joinedload(User.shop), db.joinedload(Sale.product))

    date_from = request.args.get('date_from')
    if date_from:
        query = query.filter(Sale.time >= date_from)

    date_to = request.args.get('date_to')
    if date_to:
        query = query.filter(Sale.time <= date_to)

    shop_id = request.args.get('shop_id')
    if shop_id:
        query = query.join(User).filter(User.shop_id == shop_id)

    employee_name = request.args.get('employee_name')
    if employee_name:
        query = query.join(User).filter(User.name.ilike(f'%{employee_name}%'))

    sales = query.all()
    return jsonify([{
        'id': sale.id,
        'ticket_id': sale.ticket_id,
        'time': sale.time,
        'product': {
            'name': sale.product.name
        },
        'quantity': sale.quantity,
        'total': sale.total,
        'employee': {
            'name': sale.employee.name
        },
        'shop': {
            'shop_id': sale.employee.shop.shop_id,
            'name': sale.employee.shop.name
        }
    } for sale in sales])

@owner_bp.route('/stock-in', methods=['GET'])
@jwt_required()
@owner_required()
def get_stock_ins():
    stock_ins = StockIn.query.options(db.joinedload(StockIn.shop), db.joinedload(StockIn.product)).all()
    return jsonify([{
        'id': stock_in.id,
        'stock_in_id': stock_in.stock_in_id,
        'date': stock_in.date,
        'shop': {
            'shop_id': stock_in.shop.shop_id,
            'name': stock_in.shop.name
        },
        'product': {
            'name': stock_in.product.name
        },
        'quantity': stock_in.quantity,
        'supplier': stock_in.supplier
    } for stock_in in stock_ins])

@owner_bp.route('/stock-in', methods=['POST'])
@jwt_required()
@owner_required()
def create_stock_in():
    data = request.get_json()
    new_stock_in = StockIn(
        stock_in_id=data['stock_in_id'],
        date=data['date'],
        shop_id=data['shop_id'],
        product_id=data['product_id'],
        quantity=data['quantity'],
        supplier=data.get('supplier'),
        notes=data.get('notes')
    )
    db.session.add(new_stock_in)
    db.session.commit()
    return jsonify({'message': 'Stock-in record created successfully'}), 201
