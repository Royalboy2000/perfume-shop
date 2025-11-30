# Perfume Business Management

This is a full-stack application for managing a perfume business. It includes a Python/Flask backend and a Next.js frontend.

## Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python3 -m venv venv
    ```
3.  Activate the virtual environment:
    ```bash
    source venv/bin/activate
    ```
4.  Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Create a `.env` file and add a `JWT_SECRET_KEY`:
    ```bash
    echo "JWT_SECRET_KEY=my-super-secret-key" > .env
    ```
6.  Initialize the database:
    ```bash
    flask db upgrade
    ```
7.  Create the owner account:
    ```bash
    python create_owner.py
    ```
8.  Run the backend server:
    ```bash
    flask run
    ```

## Frontend Setup

1.  Navigate to the root of the project.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file and add the `NEXT_PUBLIC_API_URL`:
    ```bash
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
    ```
4.  Run the frontend server:
    ```bash
    npm run dev
    ```
