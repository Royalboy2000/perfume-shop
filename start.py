import os
import sys
import subprocess
import argparse


def run_command(cmd, *, cwd=None, env=None):
    """Run a command, echo it, and exit on error."""
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
        help="Reset the database (delete DB, delete migrations, re-run migrations, create owner).",
    )
    parser.add_argument(
        "--env",
        default="development",
        choices=["development", "production"],
        help="Environment to run the application in.",
    )
    args = parser.parse_args()

    # ------------------------------------------------------------------
    # Paths and basics
    # ------------------------------------------------------------------
    project_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_root, "backend")
    venv_dir = os.path.join(backend_dir, "venv")
    venv_python = os.path.join(venv_dir, "bin", "python")

    # IMPORTANT: this must match how your app config builds the URI
    # If in app.py you do sqlite:///instance/app.db from backend,
    # then the real DB file is backend/instance/app.db:
    db_path = os.path.join(backend_dir, "instance", "app.db")

    migrations_dir = os.path.join(backend_dir, "migrations")
    migrations_versions_dir = os.path.join(migrations_dir, "versions")

    # ------------------------------------------------------------------
    # 1. Backend venv + dependencies
    # ------------------------------------------------------------------
    print("--- Setting up backend ---")
    if not os.path.exists(venv_python):
        print("Creating virtual environment in backend/venv ...")
        run_command(["python3", "-m", "venv", venv_dir], cwd=project_root)

    run_command(
        [venv_python, "-m", "pip", "install", "-r", "backend/requirements.txt"],
        cwd=project_root,
    )

    # Base env for Flask commands / app
    env = os.environ.copy()
    env["FLASK_APP"] = "backend/app.py"
    env["FLASK_ENV"] = args.env

    # ------------------------------------------------------------------
    # 2. Reset DB (and migrations) if requested
    # ------------------------------------------------------------------
    if args.reset_db:
        print("--- Resetting database and migrations ---")

        # Delete DB file
        instance_dir = os.path.dirname(db_path)
        os.makedirs(instance_dir, exist_ok=True)
        if os.path.exists(db_path):
            print(f"Removing existing DB: {db_path}")
            os.remove(db_path)
        else:
            print("No existing DB file found, nothing to delete.")

        # Delete migrations folder to force a fresh initial migration
        if os.path.exists(migrations_dir):
            print(f"Removing existing migrations: {migrations_dir}")
            # Use Python instead of `rm -rf` for safety
            import shutil

            shutil.rmtree(migrations_dir)

    # ------------------------------------------------------------------
    # 3. Ensure migrations exist, then apply them
    # ------------------------------------------------------------------
    if not os.path.exists(migrations_dir):
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

    # If there are no migration files yet, create an initial one
    if not os.path.exists(migrations_versions_dir) or not os.listdir(
        migrations_versions_dir
    ):
        print("--- Creating initial migration from models ---")
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

    # ------------------------------------------------------------------
    # 4. If DB was reset, create owner/admin account
    # ------------------------------------------------------------------
    if args.reset_db:
        print("\n--- Creating owner/admin account ---")
        print("You will be prompted for username + password.")
        try:
            run_command(
                [venv_python, "backend/create_owner.py"],
                cwd=project_root,
                env=env,
            )
        except SystemExit:
            print(
                "\nOwner creation failed. You can manually run:\n"
                "  source backend/venv/bin/activate && python backend/create_owner.py\n"
            )

    # ------------------------------------------------------------------
    # 5. Frontend setup
    # ------------------------------------------------------------------
    print("--- Setting up frontend ---")
    has_env_local = os.path.exists(os.path.join(project_root, ".env.local"))
    has_env_prod = os.path.exists(os.path.join(project_root, ".env.production"))
    if not has_env_local and not has_env_prod:
        print("Please create a .env.local or .env.production file in the project root.")
        sys.exit(1)

    run_command(["npm", "install", "--legacy-peer-deps"], cwd=project_root)

    # ------------------------------------------------------------------
    # 6. Start backend + frontend
    # ------------------------------------------------------------------
    print("--- Starting servers ---")
    if args.env == "production":
        # Build frontend
        run_command(["npm", "run", "build"], cwd=project_root)

        # Backend: gunicorn
        backend_cmd = [
            venv_python,
            "-m",
            "gunicorn",
            "--bind",
            "0.0.0.0:5000",
            "app:app",
        ]
        backend_cwd = backend_dir

        # Frontend: Next.js production
        frontend_cmd = ["npm", "start"]
    else:
        # Dev: run Flask dev server
        backend_cmd = [venv_python, "backend/app.py"]
        backend_cwd = project_root

        # Dev: Next.js dev server
        frontend_cmd = ["npm", "run", "dev"]

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
