# Perfume Business Management

This is a full-stack application for managing a perfume business. It includes a Python/Flask backend and a Next.js frontend.

## Backend Setup

### Development

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

### Production

1.  Follow the development setup steps 1-7.
2.  In your `backend/.env` file, you need to add the `CORS_ALLOWED_ORIGINS` environment variable. This variable should contain a comma-separated list of the frontend URLs that are allowed to make requests to the backend. For example:
    ```
    CORS_ALLOWED_ORIGINS=http://85.192.60.207:3000,http://85.192.60.207,http://localhost:3000
    ```
3.  Install a production-ready web server, like Gunicorn:
    ```bash
    pip install gunicorn
    ```
4.  Run the backend server with Gunicorn:
    ```bash
    gunicorn --bind 0.0.0.0:5000 "app:app"
    ```

## Frontend Setup

### Development

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

### Production

1.  Follow the development setup steps 1-2.
2.  Create a `.env.production` file and add the `NEXT_PUBLIC_API_URL` for your production environment:
    ```bash
    echo "NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:5000" > .env.production
    ```
    Replace `YOUR_VPS_IP` with your actual VPS IP address.
3.  Build the frontend for production:
    ```bash
    npm run build
    ```
4.  Run the production server:
    ```bash
    npm start
    ```
