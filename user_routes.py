# Backend/flask_app/user_routes.py

import os
import io
import re
import uuid
import time
import logging

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

# DB / auth objects expected to be injected from package-level __init__
from . import db, bcrypt

# =============================
# ✅ FIXED IMPORTS FOR YOUR LANGCHAIN STRUCTURE
# =============================
# Document Loading and Splitting
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Old chain types (classic)
from langchain_classic.chains import RetrievalQA

# Vector Store
from langchain_qdrant import QdrantVectorStore

# Embeddings & Models
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

# Document Schema
from langchain_core.documents import Document

# Qdrant and Utilities
from qdrant_client.http.models import VectorParams, Distance
from qdrant_client import QdrantClient

# Utilities
from dotenv import load_dotenv
import pdfplumber, pytesseract, fitz, io, os, re
from PIL import Image
import google.generativeai as genai


load_dotenv()

# ---------- logging ----------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- blueprint ----------
user_bp = Blueprint('user_bp', __name__)

# ---------- collections / constants ----------
users_collection = db.final_info

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
ALLOWED_EXTENSIONS = {"pdf"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------- environment ----------
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "Exxtractify")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
TESSERACT_CMD = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")

if not QDRANT_URL or not QDRANT_API_KEY:
    logger.warning("Qdrant URL/API key not set. Set QDRANT_URL and QDRANT_API_KEY in env.")

pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

# ---------- Qdrant client and embeddings ----------
client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY) if QDRANT_URL and QDRANT_API_KEY else None
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Ensure collection exists
if client is not None:
    try:
        existing_collections = [c.name for c in client.get_collections().collections]
        if COLLECTION_NAME not in existing_collections:
            logger.info("Creating Qdrant collection: %s", COLLECTION_NAME)
            client.recreate_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)
            )
        else:
            logger.info("Qdrant collection %s exists", COLLECTION_NAME)
    except Exception as e:
        logger.exception("Error ensuring Qdrant collection exists: %s", e)

# ---------- utils ----------
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# -------------------------------
# USER SIGNUP
# -------------------------------
@user_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    required = ["email", "password", "firstName", "lastName", "designation"]

    if not all(k in data for k in required):
        return jsonify({"message": "Missing required fields"}), 400

    if users_collection.find_one({"email": data['email']}):
        return jsonify({"message": "User already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    #  Generate unique user_id
    user_id = str(uuid.uuid4())

    #  Prepare user data
    user_data = {
        "user_id": user_id,
        "firstName": data['firstName'],
        "lastName": data['lastName'],
        "designation": data['designation'],
        "email": data['email'],
        "password": hashed_password
    }

    #  Insert into MongoDB
    users_collection.insert_one(user_data)

    #  Return response
    return jsonify({
        "message": "User registered successfully!",
        "user_id": user_id
    }), 201





# -------------------------------
# USER LOGIN
# -------------------------------
@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Missing email or password"}), 400

    user = users_collection.find_one({"email": email})
    if user and bcrypt.check_password_hash(user['password'], password):
        user_info = {
            "user_id": user.get('user_id'),
            "firstName": user.get('firstName'),
            "email": user.get('email'),
            "designation": user.get('designation')
        }
        return jsonify({"message": "Login successful", "user": user_info}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


# -------------------------------
# Helpers for PDF processing
# -------------------------------
def extract_formulas_from_images(pdf_path):
    doc = fitz.open(pdf_path)
    formulas = []

    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        text = pytesseract.image_to_string(img)

        math_lines = []
        for line in text.split("\n"):
            if re.search(r"[=+*/^√∑∫]", line):  
                clean = line.strip()
                if len(clean) > 5:
                    math_lines.append(clean)
        if math_lines:
            formulas.append((i + 1, math_lines))
    return formulas

# -----------------------------
# Step 2: Table Extraction
# -----------------------------
def extract_tables(pdf_path):
    table_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table in tables:
                table_text += f"\n\n--- Page {i+1} Table ---\n"
                for row in table:
                    table_text += "\t".join([str(cell) for cell in row if cell is not None]) + "\n"
    return table_text

# -----------------------------
# Step 3: PDF Text Chunking
# -----------------------------
def extract_text_chunks(pdf_path):
    loader = PyPDFLoader(pdf_path)
    pages = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " "]
    )
    return splitter.split_documents(pages)

# -----------------------------
# Step 4: Store in Qdrant
# -----------------------------

# def store_embeddings_in_qdrant(chunks):
# -------------------------------------------------------------------------------------------------------------
def store_embeddings_in_qdrant(chunks, user_collection):

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_config = VectorParams(size=384, distance=Distance.COSINE)

    client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY
    )

    collections = client.get_collections().collections
    collection_names = [c.name for c in collections]

    # if COLLECTION_NAME not in collection_names:
    #     print(f"Collection '{COLLECTION_NAME}' not found. Creating it now...")
        
    #     client.recreate_collection( 
    #         collection_name=COLLECTION_NAME,
    #         vectors_config=vector_config
    #     )
    # else:
    #     print(f"Collection '{COLLECTION_NAME}' exists. Adding new chunks...")
    # vectorstore = Qdrant( 
    #     client=client,
    #     collection_name=COLLECTION_NAME,
    #     embedding=embeddings
    # )
    

    if user_collection not in collection_names:
        print(f"Creating new collection for user: {user_collection}")
        client.recreate_collection(
            collection_name=user_collection,
            vectors_config=vector_config
        )
    else:
        print(f"Collection '{user_collection}' exists. Adding new chunks...")

    vectorstore = QdrantVectorStore(
        client=client,
        collection_name=user_collection,
        embedding=embeddings
    )

    vectorstore.add_documents(chunks)

    return vectorstore

   


# -------------------------------
# RAG PDF UPLOAD
# -------------------------------
@user_bp.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['file']
    user_id = request.form.get('user_id')

    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    if not user_id:
        return jsonify({"message": "Missing user_id"}), 400

    if not allowed_file(file.filename):
        return jsonify({"message": "Only PDF files allowed"}), 400

    try:
        original_filename = secure_filename(file.filename)
        unique_prefix = f"{user_id}_{int(time.time())}_{uuid.uuid4().hex[:8]}"
        filename = f"{unique_prefix}_{original_filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        logger.info("Saved file to %s", filepath)

        tables_text = extract_tables(filepath)
        formulas = extract_formulas_from_images(filepath)
        chunks = extract_text_chunks(filepath)

        if tables_text.strip():
            chunks.append(Document(page_content=tables_text, metadata={"source": filename, "type": "tables"}))

        if formulas:
            formula_text = "\n\n".join([f"Page {p}: " + " | ".join(lines) for p, lines in formulas])
            chunks.append(Document(page_content=formula_text, metadata={"source": filename, "type": "formulas"}))
# --------------------------------------------------------------------------------------------------------------------
        # Create user-specific collection name (e.g., Extractify_<user_id>)
        user_collection = f"{COLLECTION_NAME}_{user_id}"
        vectorstore = store_embeddings_in_qdrant(chunks, user_collection=user_collection)

# -------------------------------------------------------------------------------------------------------------------------
        # vectorstore = store_embeddings_in_qdrant(chunks)
        logger.info("Added %d chunks to Qdrant %s", len(chunks), COLLECTION_NAME)

        return jsonify({
            "message": "PDF processed successfully.",
            "filename": filename,
            "chunks_added": len(chunks)
        }), 201

    except Exception as e:
        logger.exception("Error in upload_pdf")
        return jsonify({"message": "Error processing PDF", "error": str(e)}), 500
    




@user_bp.route('/chat', methods=['POST'])
def chat_with_pdf():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    user_query = data.get("query")
    k = int(data.get("k", 5))

    # ✅ Validation
    if not user_id:
        return jsonify({"message": "Missing user_id"}), 400
    if not user_query:
        return jsonify({"message": "Missing query"}), 400
    if client is None:
        return jsonify({"message": "Qdrant not configured"}), 500

    try:
        # ✅ Use user-specific collection
        user_collection = f"{COLLECTION_NAME}_{user_id}"

        # ✅ Ensure the collection exists
        collections = [c.name for c in client.get_collections().collections]
        if user_collection not in collections:
            return jsonify({"message": f"No data found for user {user_id}. Upload a PDF first."}), 404

        # ✅ Create vectorstore + retriever
        vectorstore = QdrantVectorStore(
            client=client,
            collection_name=user_collection,
            embedding=embeddings
        )
        retriever = vectorstore.as_retriever(search_kwargs={"k": k})

        # ✅ LLM setup
        llm = ChatGoogleGenerativeAI(
            model=os.getenv("GOOGLE_GEMINI_MODEL", "gemini-2.5-flash"),
            temperature=0.6,
            google_api_key=GOOGLE_API_KEY
        )

        # ✅ RAG setup
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True
        )

        # ✅ Run the query
        response = qa_chain.invoke({"query": user_query})
        answer = response.get("result", "")
        sources = [
            {"page_content": doc.page_content[:300]}
            for doc in response.get("source_documents", [])
        ]

        # ✅ Save chat history for each user
        users_collection.update_one(
            {"user_id": user_id},
            {"$push": {
                "chat_history": {
                    "query": user_query,
                    "answer": answer,
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                }
            }},
            upsert=False
        )

        # ✅ Return to frontend
        return jsonify({
            "message": "Answer generated successfully",
            "user_id": user_id,
            "query": user_query,
            "answer": answer,
            "sources": sources
        }), 200

    except Exception as e:
        logger.exception("Error in /chat")
        return jsonify({
            "message": "Error generating answer",
            "error": str(e)
        }), 500

@user_bp.route('/chat_history/<user_id>', methods=['GET'])
def get_chat_history(user_id):
    chats = users_collection.find({"user_id": user_id}).sort("timestamp", -1)
    history = [
        {"query": chat["query"], "answer": chat["answer"], "timestamp": chat["timestamp"]}
        for chat in chats
    ]
    return jsonify({"history": history}), 200


# --------------------------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------------------------


# @app.route('/get_bot_chat_history', methods=['GET'])
# @jwt_required()
# def get_bot_chat_history():
#     user_id = get_jwt_identity()
#     bot_id = request.args.get('bot_id')

#     if not bot_id:
#         return jsonify({"error": "Missing bot_id parameter"}), 400

#     try:
#         # Fetch only this user's bot's chat history
#         history_cursor = chat_history.find(
#             {"user_id": user_id, "bot_id": bot_id},
#             {"_id": 0, "query": 1, "answer": 1, "timestamp": 1}
#         ).sort("timestamp", -1)  # newest first

#         history = list(history_cursor)

#         return jsonify({"history": history}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500






# @app.route('/get_my_chatbots', methods=['GET'])
# @jwt_required()
# def get_my_chatbots():
#     user_id = get_jwt_identity()

#     try:
#         bots_cursor = chatbot_collection.find(
#             {"user_id": user_id},
#             {"_id": 0, "bot_id": 1, "chatbot_name": 1, "input_type": 1, "created_at": 1}
#         ).sort("created_at", -1)

#         bots = list(bots_cursor)

#         return jsonify({"chatbots": bots}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
