from db import db
from bcrypt import hashpw, gensalt, checkpw

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shop.id'), nullable=True)
    role = db.Column(db.String(50), nullable=False)
    contact = db.Column(db.String(50), nullable=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    shop = db.relationship('Shop', backref=db.backref('employees', lazy=True))

    def set_password(self, password):
        self.password = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')

    def check_password(self, password):
        return checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

class Shop(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    manager = db.Column(db.String(100), nullable=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    cost_price = db.Column(db.Float, nullable=False)
    selling_price = db.Column(db.Float, nullable=False)
    reorder_level = db.Column(db.Integer, nullable=False)

class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    shop_id = db.Column(db.Integer, db.ForeignKey('shop.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    current_stock = db.Column(db.Integer, nullable=False)
    shop = db.relationship('Shop', backref=db.backref('inventory', lazy=True))
    product = db.relationship('Product', backref=db.backref('inventory', lazy=True))

class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.String(50), nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Float, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product = db.relationship('Product', backref=db.backref('sales', lazy=True))
    employee = db.relationship('User', backref=db.backref('sales', lazy=True))

class StockIn(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    stock_in_id = db.Column(db.String(50), unique=True, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shop.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    supplier = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    shop = db.relationship('Shop', backref=db.backref('stock_ins', lazy=True))
    product = db.relationship('Product', backref=db.backref('stock_ins', lazy=True))
