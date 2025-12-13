import os
import json
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.rag import ingest_file, query_answer, clear_session

app = FastAPI(
    title="RAG Backend - TechDocs Assistant",
    version="1.0.0",
    description="Asistente técnico con arquitectura RAG y Gemini"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- UPLOAD ----------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Solo se permiten archivos PDF"
            )

        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{file.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = ingest_file(file_path)
        return {"status": "ok", "details": result}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        print("[UPLOAD ERROR]", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Error interno al procesar el archivo"
        )


# ---------- QUERY ----------
@app.post("/query")
async def query_rag(data: dict):
    query = data.get("query")
    doc_id = data.get("documentId")

    if not query or not doc_id:
        raise HTTPException(
            status_code=400,
            detail="Faltan 'query' o 'documentId'"
        )

    try:
        return query_answer(query, doc_id)
    except Exception as e:
        print("[QUERY ERROR]", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Error procesando la consulta"
        )


# ---------- CLEAR ----------
@app.post("/clear")
async def clear_rag():
    return clear_session()


# ---------- LIST DOCUMENTS ----------
@app.get("/documents")
async def list_documents():
    uploads_folder = "uploads"
    if not os.path.exists(uploads_folder):
        return []

    return [
        {"id": f, "name": f}
        for f in os.listdir(uploads_folder)
        if os.path.isfile(os.path.join(uploads_folder, f))
    ]


# ---------- HEALTH ----------
@app.get("/")
async def root():
    return {"status": "ok", "service": "RAG Backend"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
