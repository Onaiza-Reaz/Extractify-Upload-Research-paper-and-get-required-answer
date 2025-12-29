




# Backend/flask_app/__init__.py

from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from flask_jwt_extended import JWTManager   # ✅ ADD THIS IMPORT
import certifi
import os
from dotenv import load_dotenv
from datetime import timedelta

# -------------------------------------------------------------------
# Load environment variables
# -------------------------------------------------------------------
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise ValueError("❌ MONGO_URI not found in .env file!")

# -------------------------------------------------------------------
# MongoDB Connection
# -------------------------------------------------------------------
mongo_client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = mongo_client["Extractify"]

# -------------------------------------------------------------------
# Flask app factory
# -------------------------------------------------------------------
bcrypt = Bcrypt()
jwt = JWTManager()   # ✅ Create JWTManager instance globally

# def create_app():
#     app = Flask(__name__)
#     app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')

#     # ✅ JWT Configuration
#     app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretjwtkey")
#     app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

#     # ✅ Initialize extensions
#     # CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
#     CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
#          supports_credentials=True)
#     bcrypt.init_app(app)
#     jwt.init_app(app)   # ✅ Initialize JWT with Flask app

#     # ✅ Register Blueprints
#     from .users import user_bp
#     app.register_blueprint(user_bp, url_prefix="/api")

#     # ✅ Confirm Mongo connection
#     try:
#         db.list_collection_names()
#         print("✅ MongoDB connected successfully to 'Extractify'")
#     except Exception as e:
#         print("❌ MongoDB connection failed:", e)

#     return app
















def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')

    # ✅ JWT Configuration
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretjwtkey")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

    # ✅ Initialize extensions
    CORS(app, resources={r"/*": {"origins": "*"}})  # ✅ allows React frontend

    bcrypt.init_app(app)
    jwt.init_app(app)  # ✅ Initialize JWT with Flask app

    # ✅ Register Blueprints
    from .users import user_bp
    app.register_blueprint(user_bp, url_prefix="/api")

    # ✅ Confirm Mongo connection
    try:
        db.list_collection_names()
        print("✅ MongoDB connected successfully to 'Extractify'")
    except Exception as e:
        print("❌ MongoDB connection failed:", e)

    return app
