// ecosystem.config.js
module.exports = {
    apps: [{
        name: "shelf-backend", // Choose a name for your app
        script: "/home/shaily/code/poc/poc1/purehd-bookstore-poc/backend/venv/bin/uvicorn",       // Path to uvicorn within your venv
        args: "main:app --host 127.0.0.1 --port 13688 --workers 4", // Use relative path to main.py
        interpreter: "/home/shaily/code/poc/poc1/purehd-bookstore-poc/backend/venv/bin/python",    // Path to python interpreter in venv
        cwd: ".",                        // Current directory
        env: {
            // You can define environment variables here,
            // but using .env is often preferred and handled by python-dotenv
            "PYTHONUNBUFFERED": "1", // Recommended for logging
            "PYTHONPATH": ".",       // Add current directory to Python path
            "FRONTEND_URL": "https://shelf.shaily.dev"
        }
    }]
}