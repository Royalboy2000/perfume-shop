import os
import subprocess
import argparse

def run_command(command, shell=False, use_bash=False):
    """Runs a command and prints its output."""
    try:
        executable = '/bin/bash' if use_bash else None
        subprocess.run(command, shell=shell, check=True, executable=executable)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(e)
        exit(1)

def main():
    parser = argparse.ArgumentParser(description="Startup script for the perfume shop application.")
    parser.add_argument("--reset-db", action="store_true", help="Reset the database.")
    parser.add_argument("--env", default="development", choices=["development", "production"], help="Environment to run the application in.")
    args = parser.parse_args()

    # Backend setup
    print("--- Setting up backend ---")
    if not os.path.exists("backend/venv"):
        run_command(["python3", "-m", "venv", "backend/venv"])

    activate_script = "source backend/venv/bin/activate"

    run_command(f"{activate_script} && pip install -r backend/requirements.txt", shell=True, use_bash=True)

    if args.reset_db:
        print("--- Resetting database ---")
        if os.path.exists("backend/instance/app.db"):
            os.remove("backend/instance/app.db")
        if os.path.exists("backend/migrations"):
            run_command("rm -rf backend/migrations", shell=True)

    # Handle DB migrations
    if not os.path.exists("backend/migrations"):
        # This branch handles initial setup and resets
        init_commands = f"""
        {activate_script} && \
        export FLASK_APP=backend/app.py && \
        flask db init --directory backend/migrations && \
        flask db migrate --directory backend/migrations && \
        flask db upgrade --directory backend/migrations
        """
        run_command(init_commands, shell=True, use_bash=True)
    else:
        # For normal startups, just apply migrations
        upgrade_command = f"""
        {activate_script} && \
        export FLASK_APP=backend/app.py && \
        flask db upgrade --directory backend/migrations
        """
        run_command(upgrade_command, shell=True, use_bash=True)

    # Create owner account
    print("\\n--- To create an owner account, run the following command in a separate terminal: ---")
    print(f"{activate_script} && python backend/create_owner.py\\n")

    # Frontend setup
    print("--- Setting up frontend ---")
    if not os.path.exists(".env.local") and not os.path.exists(".env.production"):
        print("Please create a .env.local or .env.production file.")
        exit(1)
    run_command(["npm", "install", "--legacy-peer-deps"])

    # Start servers
    print("--- Starting servers ---")
    if args.env == "production":
        run_command(["npm", "run", "build"])
        backend_command = f"{activate_script} && gunicorn --bind 0.0.0.0:5000 'app:app'"
        frontend_command = "npm start"
    else:
        backend_command = f"{activate_script} && python backend/app.py"
        frontend_command = "npm run dev"

    backend_process = subprocess.Popen(backend_command, shell=True, executable='/bin/bash')
    frontend_process = subprocess.Popen(frontend_command, shell=True)

    try:
        frontend_process.wait()
    except KeyboardInterrupt:
        backend_process.kill()

if __name__ == "__main__":
    main()
