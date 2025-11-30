# Perfume Business Management

This is a full-stack application for managing a perfume business. It includes a Flask backend and a Next.js frontend.

## Setup

### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a Python virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the virtual environment:
    ```bash
    source venv/bin/activate
    ```
4.  Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Initialize the database:
    ```bash
    flask db upgrade
    ```
6.  Create an owner account:
    ```bash
    python create_owner.py
    ```
7.  Run the backend server:
    ```bash
    python app.py
    ```

### Frontend

1.  Navigate to the root directory.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in the root directory and add the following line:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```
4.  Run the frontend server:
    ```bash
    npm run dev
    ```

## Usage

*   The application will be available at `http://localhost:3000`.
*   Log in with the owner credentials you created during the setup.
