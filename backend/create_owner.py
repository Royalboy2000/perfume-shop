import os
import sys
from getpass import getpass

# Add the backend directory to the Python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app import app, db
from models import User

def create_owner():
    with app.app_context():
        username = input("Enter owner username: ")
        password = getpass("Enter owner password: ")

        if User.query.filter_by(username=username).first():
            print("User with this username already exists.")
            return

        owner = User(
            employee_id="OWNER",
            name="Owner",
            role="owner",
            username=username
        )
        owner.set_password(password)
        db.session.add(owner)
        db.session.commit()
        print("Owner account created successfully.")

if __name__ == '__main__':
    create_owner()
