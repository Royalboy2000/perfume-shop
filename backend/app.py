from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv
from flask_cors import CORS
from db import db
from auth import auth_bp
from owner_routes import owner_bp
from employee_routes import employee_bp
from api_routes import api_bp

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret')

CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={r"/*": {"origins": CORS_ALLOWED_ORIGINS}})
jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(owner_bp, url_prefix='/owner')
app.register_blueprint(employee_bp, url_prefix='/employee')
app.register_blueprint(api_bp, url_prefix='/api')

import models

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
