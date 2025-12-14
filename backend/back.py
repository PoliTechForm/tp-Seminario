import os
import json
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware



from backend.rag import (
    ingest_file,
    query_answer,
    clear_session,
    vectorstores,
    retrievers,
    document_sources
)

# =====================
# CONFIG
# =====================
UPLOADS_DIR = "uploads"
METADATA_PATH = os.path.join(UPLOADS_DIR, "metadata.json")

# =====================
# APP
# =====================
app = FastAPI(
    title="RAG Backend - TechDocs Assistant",
    version="1.0.0",
    description="RAG con filesystem efímero (Render)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# HELPERS
# =====================
def load_metadata() -> dict:
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_metadata(metadata: dict):
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

# =====================
# UPLOAD
# =====================
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Solo se permiten archivos PDF")

    os.makedirs(UPLOADS_DIR, exist_ok=True)

    doc_id = f"{uuid.uuid4().hex}.pdf"
    file_path = os.path.join(UPLOADS_DIR, doc_id)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    metadata = load_metadata()
    metadata[doc_id] = file.filename
    save_metadata(metadata)

    ingest_file(file_path)

    return {
        "status": "ok",
        "id": doc_id,
        "name": file.filename
    }

# =====================
# QUERY
# =====================
@app.post("/query")
async def query_rag(data: dict):
    query = data.get("query")
    document_id = data.get("documentId")

    if not query or not document_id:
        raise HTTPException(400, "Faltan 'query' o 'documentId'")

    return query_answer(query, document_id)

# =====================
# CLEAR RAG
# =====================
@app.post("/clear")
async def clear_rag():
    return clear_session()

# =====================
# LIST DOCUMENTS
# =====================
@app.get("/documents")
async def list_documents():
    metadata = load_metadata()
    return [{"id": k, "name": v} for k, v in metadata.items()]

# =====================
# DELETE DOCUMENT
# =====================
@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    file_path = os.path.join(UPLOADS_DIR, doc_id)

    if not os.path.exists(file_path):
        raise HTTPException(404, "Documento no encontrado")

    os.remove(file_path)

    metadata = load_metadata()
    metadata.pop(doc_id, None)
    save_metadata(metadata)

    vectorstores.pop(doc_id, None)
    retrievers.pop(doc_id, None)
    document_sources.pop(doc_id, None)

    return {
        "status": "ok",
        "message": f"Documento {doc_id} eliminado"
    }

# =====================
# HEALTH
# =====================
@app.get("/")
async def root():
    return {
        "status": "ok",
        "storage": "ephemeral"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "storage": "ephemeral"
    }
