import os
import sys
import subprocess
import argparse


def run_command(cmd, *, cwd=None, env=None):
    """Run a command, echo it, and fail hard on error."""
    print(f"$ {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True, cwd=cwd, env=env)
    except subprocess.CalledProcessError as e:
        print(f"\nError running command: {' '.join(cmd)}")
        print(e)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Startup script for the perfume shop application."
    )
    parser.add_argument(
        "--reset-db",
        action="store_true",
        help="Reset the database (delete DB file, re-run migrations, create owner).",
    )
    parser.add_argument(
        "--env",
        default="development",
        choices=["development", "production"],
        help="Environment to run the application in.",
    )
    args = parser.parse_args()

    # Paths
    project_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_root, "backend")
    venv_dir = os.path.join(backend_dir, "venv")
    venv_python = os.path.join(venv_dir, "bin", "python")
    db_path = os.path.join(backend_dir, "instance", "app.db")
    migrations_dir = os.path.join(backend_dir, "migrations")

    # ---------------------------------------------------------------------
    # 1. Backend venv + dependencies
    # ---------------------------------------------------------------------
    print("--- Setting up backend ---")
    if not os.path.exists(venv_python):
        print("Creating virtual environment in backend/venv ...")
        run_command(["python3", "-m", "venv", venv_dir], cwd=project_root)

    # Install Python deps into the venv
    run_command(
        [venv_python, "-m", "pip", "install", "-r", "backend/requirements.txt"],
        cwd=project_root,
    )

    # Base env for all Flask commands
    env = os.environ.copy()
    # Use path-style FLASK_APP because backend is a folder, not a package
    env["FLASK_APP"] = "backend/app.py"
    env["FLASK_ENV"] = args.env

    # ---------------------------------------------------------------------
    # 2. Reset DB (only deletes the SQLite file, keeps migrations!)
    # ---------------------------------------------------------------------
    if args.reset_db:
        print("--- Resetting database ---")
        # Ensure instance dir exists
        instance_dir = os.path.dirname(db_path)
        os.makedirs(instance_dir, exist_ok=True)

        if os.path.exists(db_path):
            print(f"Removing existing DB: {db_path}")
            os.remove(db_path)
        else:
            print("No existing DB file found, nothing to delete.")

    # ---------------------------------------------------------------------
    # 3. Ensure migrations exist, then apply them
    # ---------------------------------------------------------------------
    # If no migrations folder yet (fresh clone), init + migrate
    if not os.path.exists(migrations_dir) or not os.listdir(
        os.path.join(migrations_dir, "versions")
    ):
        print("--- Initializing migrations ---")
        # flask db init
        run_command(
            [
                venv_python,
                "-m",
                "flask",
                "db",
                "init",
                "--directory",
                "backend/migrations",
            ],
            cwd=project_root,
            env=env,
        )
        # flask db migrate -m "initial"
        run_command(
            [
                venv_python,
                "-m",
                "flask",
                "db",
                "migrate",
                "--directory",
                "backend/migrations",
                "-m",
                "initial",
            ],
            cwd=project_root,
            env=env,
        )

    print("--- Applying migrations ---")
    run_command(
        [
            venv_python,
            "-m",
            "flask",
            "db",
            "upgrade",
            "--directory",
            "backend/migrations",
        ],
        cwd=project_root,
        env=env,
    )

    # ---------------------------------------------------------------------
    # 4. If DB was reset, automatically create owner/admin account
    # ---------------------------------------------------------------------
    if args.reset_db:
        print("\n--- Creating owner/admin account ---")
        print("You will be prompted for username + password.")
        try:
            # Reuse the existing script that knows how to create the owner
            run_command(
                [venv_python, "backend/create_owner.py"],
                cwd=project_root,
                env=env,
            )
        except SystemExit:
            # run_command already printed the error
            print(
                "\nOwner creation failed. You can manually run:\n"
                "  source backend/venv/bin/activate && python backend/create_owner.py\n"
            )

    # ---------------------------------------------------------------------
    # 5. Frontend setup
    # ---------------------------------------------------------------------
    print("--- Setting up frontend ---")
    has_env_local = os.path.exists(os.path.join(project_root, ".env.local"))
    has_env_prod = os.path.exists(os.path.join(project_root, ".env.production"))
    if not has_env_local and not has_env_prod:
        print("Please create a .env.local or .env.production file in the project root.")
        sys.exit(1)

    run_command(["npm", "install", "--legacy-peer-deps"], cwd=project_root)

    # ---------------------------------------------------------------------
    # 6. Start backend + frontend
    # ---------------------------------------------------------------------
    print("--- Starting servers ---")
    if args.env == "production":
        # Build frontend
        run_command(["npm", "run", "build"], cwd=project_root)

        # Backend: gunicorn, run from backend dir so 'app:app' resolves
        backend_cmd = [
            venv_python,
            "-m",
            "gunicorn",
            "--bind",
            "0.0.0.0:5000",
            "app:app",
        ]
        backend_cwd = backend_dir

        # Frontend: Next.js production start
        frontend_cmd = ["npm", "start"]
    else:
        # Development: run Flask dev server from root using backend/app.py
        backend_cmd = [venv_python, "backend/app.py"]
        backend_cwd = project_root

        # Frontend: Next.js dev server
        frontend_cmd = ["npm", "run", "dev"]

    # Start both processes
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_cwd, env=env)
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=project_root)

    try:
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping servers...")
    finally:
        backend_proc.terminate()


if __name__ == "__main__":
    main()
