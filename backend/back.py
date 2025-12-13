import os
import json
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from rag import ingest_file, query_answer, clear_session


API_KEY = os.getenv("API_KEY")

if not API_KEY:
    print("[WARN] No se encontró API_KEY en .env")

app = FastAPI(
    title="RAG Backend - TechDocs Assistant",
    version="1.0.0",
    description="Asistente técnico para documentación interna con arquitectura RAG y Gemini 2.5-Flash."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{file.filename}"
        print(f"[UPLOAD] Guardando archivo en: {file_path}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        result = ingest_file(file_path)
        return {"status": "ok", "details": result}
    except Exception as e:
        print(f"[UPLOAD ERROR]: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query")
async def query_rag(data: dict):
    try:
        print("DATA RECIBIDA EN /query:", data)
        query = data.get("query")
        doc_id = data.get("documentId")
        if not query or not doc_id:
            raise HTTPException(status_code=400, detail="Faltan 'query' o 'documentId'")
        response = query_answer(query, doc_id)
        response["answer"] = response.get("answer", "")
        return response
    except Exception as e:
        print("[ERROR /query]:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clear")
async def clear_rag():
    try:
        return clear_session()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents():
    uploads_folder = "uploads"
    docs = []
    if not os.path.exists(uploads_folder):
        return docs
    for fname in os.listdir(uploads_folder):
        fpath = os.path.join(uploads_folder, fname)
        if os.path.isfile(fpath):
            docs.append({"id": fname, "name": fname})
    return docs

@app.get("/chat/{doc_id}")
async def get_chat(doc_id: str):
    path = f"chats/{doc_id}.json"
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@app.post("/chat/{doc_id}")
async def post_chat(doc_id: str, data: dict):
    msg = data.get("message")
    os.makedirs("chats", exist_ok=True)
    path = f"chats/{doc_id}.json"
    messages = []
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            messages = json.load(f)
    messages.append(msg)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"status": "ok", "service": "RAG Backend - TechDocs Assistant"}
@app.get("/health")
async def health():
    return {"status": "healthy"}
