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






genai.configure(api_key="AIzaSyBsy-zCN7Lrnm9r2fSSTFtd_0vM7n_upGU")
load_dotenv()
print("TOKEN Loaded:", bool(os.getenv("HUGGINGFACEHUB_API_TOKEN")))

pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

QDRANT_URL = "https://e477462e-4e72-4ece-adbe-b0f7d5e004eb.us-east4-0.gcp.cloud.qdrant.io"
QDRANT_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.6AFZ9roYSppC387jTrIcHwdeB0ePfdJRDFIpNVIAnLA"
COLLECTION_NAME = "Exxtractify"

# -----------------------------
# Step 1: OCR + Formula Detection
# -----------------------------
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

def store_embeddings_in_qdrant(chunks):
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_config = VectorParams(size=384, distance=Distance.COSINE)

    client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY
    )

    collections = client.get_collections().collections
    collection_names = [c.name for c in collections]

    if COLLECTION_NAME not in collection_names:
        print(f"Collection '{COLLECTION_NAME}' not found. Creating it now...")
        
        client.recreate_collection( 
            collection_name=COLLECTION_NAME,
            vectors_config=vector_config
        )
    else:
        print(f"Collection '{COLLECTION_NAME}' exists. Adding new chunks...")
    vectorstore = QdrantVectorStore( 
        client=client,
        collection_name=COLLECTION_NAME,
        embedding=embeddings
    )
    
    vectorstore.add_documents(chunks)

    return vectorstore

   


def get_qa_chain_qdrant(vectorstore):
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.6,
        google_api_key="AIzaSyBsy-zCN7Lrnm9r2fSSTFtd_0vM7n_upGU",
    )

    # ✅ use RetrievalQA.from_chain_type for classic
    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
        return_source_documents=True
    )

# -----------------------------
# Main Processing
# -----------------------------
def process_pdf(pdf_path):
    print("\n🚀 Research Paper Extractor Started!")

    print("\n📐 Extracting formulas from images using Tesseract...")
    formulas = extract_formulas_from_images(pdf_path)

    print("\n📊 Extracting tables...")
    table_text = extract_tables(pdf_path)

    print("\n✂️ Splitting PDF text into chunks...")
    chunks = extract_text_chunks(pdf_path)
    print(f"\n📄 Extracted and chunked {len(chunks)} segments.")

    print("\n🧠 Storing embeddings in Qdrant...")
    vectorstore = store_embeddings_in_qdrant(chunks)
    print("✅ Stored in Qdrant with embeddings.")

    qa_chain = get_qa_chain_qdrant(vectorstore)

    question = "Read the uploaded research paper carefully and identify which machine learning models or algorithms are " \
    "discussed or implemented in it. Specify whether the paper is a review paper or an experimental study." \
    " Summarize the key models mentioned (e.g., supervised, "\
    "unsupervised, or reinforcement learning), their main purposes, and any algorithms used within those categories."
    response = qa_chain.invoke({"query": question})

    print("\n📘 AI Answer:")
    print(response["result"])

    print("\n📊 Table Data Sample:")
    print(table_text[:500])

    print("\n📐 Detected Math-like Formulas from PDF Images:")
    for page_num, lines in formulas:
        print(f"\n--- Page {page_num} ---")
        for line in lines:
            print("🧮", line)

# -----------------------------
# Execute
# -----------------------------
if __name__ == "__main__":
    process_pdf("research_paper.pdf")
