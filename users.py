# Backend/flask_app/user_routes.py

import os
import io
import re
import uuid
import time
import logging
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.utils import secure_filename

# Database + Auth from __init__.py
from . import db, bcrypt

# LangChain / Qdrant imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_classic.chains import RetrievalQA
from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.documents import Document
from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, Distance

from dotenv import load_dotenv
import pdfplumber, pytesseract, fitz
from PIL import Image
import google.generativeai as genai

# ----------------------------------
# SETUP
# ----------------------------------
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

user_bp = Blueprint('user_bp', __name__)

users_collection = db.final_info
chatbot_collection = db.chatbots
counters_collection = db.counters
chat_history = db.chat_history







UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
BASE_COLLECTION = os.getenv("QDRANT_COLLECTION", "Extractify")

pytesseract.pytesseract.tesseract_cmd = os.getenv(
    "TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY) if QDRANT_URL and QDRANT_API_KEY else None
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
print("Existing Qdrant collections:", client.get_collections())

if client:
    try:
        existing = [c.name for c in client.get_collections().collections]

        if BASE_COLLECTION not in existing:
            client.recreate_collection(
                collection_name=BASE_COLLECTION,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)
            )
    except Exception as e:
        logger.exception("Error ensuring Qdrant base collection: %s", e)


# ----------------------------------
# HELPERS
# ----------------------------------
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == "pdf"

def extract_pdf_text(filepath):
    loader = PyPDFLoader(filepath)
    pages = loader.load()
    return "\n".join([page.page_content for page in pages])

def get_text_chunks(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " "]
    )
    docs = splitter.create_documents([text])
    return docs

def create_qdrant_index(chunks, collection_name):
    try:
        if client is None:
            raise Exception("Qdrant not configured")

        collections = [c.name for c in client.get_collections().collections]
        if collection_name not in collections:
            client.recreate_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)
            )

        vectorstore = QdrantVectorStore(
            client=client,
            collection_name=collection_name,
            embedding=embeddings
        )
        vectorstore.add_documents(chunks)
        logger.info(f"✅ Stored {len(chunks)} chunks in collection: {collection_name}")

    except Exception as e:
        logger.exception("Error creating Qdrant index")
        raise


# ----------------------------------
# USER SIGNUP
# ----------------------------------
@user_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    required = ["email", "password", "firstName", "lastName", "designation"]

    if not all(k in data for k in required):
        return jsonify({"message": "Missing required fields"}), 400

    if users_collection.find_one({"email": data['email']}):
        return jsonify({"message": "User already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user_id = str(uuid.uuid4())

    user_data = {
        "user_id": user_id,
        "firstName": data['firstName'],
        "lastName": data['lastName'],
        "designation": data['designation'],
        "email": data['email'],
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }

    users_collection.insert_one(user_data)

    # ✅ Create JWT token after signup
    access_token = create_access_token(identity=user_id, expires_delta=timedelta(days=1))

    return jsonify({
        "message": "User registered successfully",
        "user_id": user_id,
        "token": access_token
    }), 200


# ----------------------------------
# USER LOGIN
# ----------------------------------
@user_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Missing email or password"}), 400

        # ✅ Find user by email
        user = users_collection.find_one({"email": email})
        if not user:
            return jsonify({"message": "User not found"}), 404

        # ✅ Check password hash
        if not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"message": "Invalid credentials"}), 401

        # ✅ Create JWT token valid for 1 day
        access_token = create_access_token(
            identity=str(user["user_id"]),  # identity must be serializable
            expires_delta=timedelta(days=1)
        )

        # ✅ Prepare user info (to send to frontend)
        user_info = {
            "id": str(user["user_id"]),
            "firstName": user.get("firstName", ""),
            "email": user.get("email", ""),
            "designation": user.get("designation", "")
        }

        # ✅ Send both token and user info
        return jsonify({
            "message": "Login successful",
            "user": user_info,
            "token": access_token
        }), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"message": "Internal server error"}), 500


# ----------------------------------
# UPLOAD PDF -> CREATE CHATBOT
# ----------------------------------


@user_bp.route('/upload_pdf', methods=['POST'])
@jwt_required()
def upload_pdf():
    try:
        # ✅ 1. Get current user identity from JWT
        user_id = get_jwt_identity()
        print("Current user ID:", user_id)

        chatbot_name = request.form.get("chatbot_name")
        pdf = request.files.get("pdf")

        if not chatbot_name or not pdf:
            return jsonify({"error": "Missing chatbot name or PDF file"}), 400

        # ✅ 2. Save uploaded PDF temporarily
        filename = secure_filename(pdf.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        pdf.save(filepath)

        # ✅ 3. Extract and chunk text
        text = extract_pdf_text(filepath)
        chunks = get_text_chunks(text)

        # ✅ 4. Generate unique bot_id
        counter = counters_collection.find_one_and_update(
            {"name": "bot_id"},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=True
        )
        bot_id = f"B{counter['seq']:03d}"

        # ✅ 5. Fetch user’s collection_name from MongoDB (or auto-create if missing)
        user_doc = users_collection.find_one({"user_id": user_id}, {"collection_name": 1})
        if not user_doc:
            return jsonify({"error": "User not found"}), 404

        collection_name = user_doc.get("collection_name")
        if not collection_name:
            # Generate collection name once for user if not already present
            collection_name = f"user_{user_id.lower()}"
            users_collection.update_one(
                {"user_id": user_id},
                {"$set": {"collection_name": collection_name}}
            )

        # ✅ 6. Create or update Qdrant index for this user
        create_qdrant_index(chunks, collection_name)

        # ✅ 7. Save bot metadata in MongoDB
        chatbot_doc = {
            "bot_id": bot_id,
            "user_id": user_id,
            "chatbot_name": chatbot_name,
            "input_type": "pdf",
            "collection_name": collection_name,
            "pdf_file": {
                "filename": filename,
                "content_type": pdf.content_type
            },
            "created_at": datetime.utcnow()
        }
        chatbot_collection.insert_one(chatbot_doc)

        return jsonify({
            "message": "Chatbot created successfully",
            "bot_id": bot_id,
            "collection_name": collection_name
        }), 201

    except Exception as e:
        logger.exception("Error in upload_pdf")
        return jsonify({"error": str(e)}), 500


















@user_bp.route("/my_bots", methods=["GET"])
@jwt_required()
def get_user_bots():
    user_id = get_jwt_identity()
    bots = list(chatbot_collection.find({"user_id": user_id}, {"_id": 0, "bot_id": 1, "chatbot_name": 1}))
    return jsonify({"bots": bots}), 200




@user_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat_with_pdf():
    try:
        # ✅ 1. Get user from JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Unauthorized user"}), 401

        # ✅ 2. Parse request data
        data = request.get_json(silent=True) or {}
        bot_id = data.get("bot_id")
        query = data.get("query")
        k = int(data.get("k", 5))

        if not bot_id or not query:
            return jsonify({"error": "Missing bot_id or query"}), 400

        # ✅ 3. Fetch bot document and verify user
        bot_doc = chatbot_collection.find_one(
            {"user_id": user_id, "bot_id": bot_id},
            {"collection_name": 1}
        )
        if not bot_doc:
            return jsonify({"error": "Bot not found or unauthorized"}), 404

        collection_name = bot_doc["collection_name"]

        # ✅ 4. Create Qdrant retriever using user’s collection
        vectorstore = QdrantVectorStore(
            client=client,
            collection_name=collection_name,
            embedding=embeddings
        )
        retriever = vectorstore.as_retriever(search_kwargs={"k": k})

        # ✅ 5. Initialize LLM
        llm = ChatGoogleGenerativeAI(
            model=os.getenv("GOOGLE_GEMINI_MODEL", "gemini-2.5-flash"),
            temperature=0.6,
            google_api_key=GOOGLE_API_KEY
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True
        )

        # ✅ 6. Query the model
        response = qa_chain.invoke({"query": query})
        answer = response.get("result", "").strip()

        if not answer:
            answer = "Sorry, I couldn’t find any relevant information in your document."

        sources = [
            {"page_content": doc.page_content[:300]}
            for doc in response.get("source_documents", [])
        ]

        # ✅ 7. Save chat history
        chatbot_collection.update_one(
            {"user_id": user_id, "bot_id": bot_id},
            {"$push": {
                "chat_history": {
                    "query": query,
                    "answer": answer,
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                }
            }}
        )

        # ✅ 8. Return final response
        return jsonify({
            "message": "Answer generated successfully",
            "bot_id": bot_id,
            "answer": answer,
            "sources": sources
        }), 200

    except Exception as e:
        logger.exception("Error in /chat")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500














# ----------------------------------
# GET CHAT HISTORY
# ----------------------------------
@user_bp.route('/chat_history/<bot_id>', methods=['GET'])
@jwt_required()
def get_chat_history(bot_id):
    user_id = get_jwt_identity()
    bot = chatbot_collection.find_one({"user_id": user_id, "bot_id": bot_id}, {"chat_history": 1})
    history = bot.get("chat_history", []) if bot else []
    return jsonify({"history": history}), 200


########################################################################################################################
########################################################################################################################
########################################################################################################################
########################################################################################################################
########################################################################################################################

@user_bp.route('/get_bot_chat_history', methods=['GET'])
@jwt_required()
def get_bot_chat_history():
    user_id = get_jwt_identity()
    bot_id = request.args.get('bot_id')

    if not bot_id:
        return jsonify({"error": "Missing bot_id parameter"}), 400

    try:
        # Fetch only this user's bot's chat history
        history_cursor = chat_history.find(
            {"user_id": user_id, "bot_id": bot_id},
            {"_id": 0, "query": 1, "answer": 1, "timestamp": 1}
        ).sort("timestamp", -1)

        history = list(history_cursor)
        return jsonify({"history": history}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@user_bp.route('/get_my_chatbots', methods=['GET'])
@jwt_required()
def get_my_chatbots():
    user_id = get_jwt_identity()

    try:
        bots_cursor = chatbot_collection.find(
            {"user_id": user_id},
            {"_id": 0, "bot_id": 1, "chatbot_name": 1, "input_type": 1, "created_at": 1}
        ).sort("created_at", -1)

        bots = list(bots_cursor)
        return jsonify({"chatbots": bots}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
