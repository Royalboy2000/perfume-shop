from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
import os
import logging
from dotenv import load_dotenv
from flask_cors import CORS
from db import db
from auth import auth_bp
from owner_routes import owner_bp
from employee_routes import employee_bp
from api_routes import api_bp

load_dotenv()

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.StreamHandler()
handler.setFormatter(formatter)
app.logger.addHandler(handler)

# Use an absolute path for the database to avoid ambiguity
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'app.db')
os.makedirs(os.path.dirname(db_path), exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
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
