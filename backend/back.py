import re
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from rag import ingest_file, query_answer, clear_session, get_history
import shutil

# --- Sanitizador seguro ---
def sanitize_text(text: str) -> str:
    """Elimina HTML, entidades y caracteres no imprimibles."""
    if not isinstance(text, str):
        return ""
    text = re.sub(r"<[^>]*>", "", text)           # etiquetas HTML
    text = re.sub(r"&[a-z]+;", "", text)          # entidades HTML (&nbsp;, &lt;, etc.)
    text = re.sub(r"[^\x20-\x7E\n\r\t]", "", text)  # caracteres no imprimibles
    return text.strip()

# --- Cargar variables ---
load_dotenv()
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    print("⚠️ No se encontró API_KEY.")

# --- Crear app ---
app = FastAPI(
    title="RAG Backend - TechDocs Assistant",
    version="1.0.0",
    description="Asistente técnico para documentación interna con arquitectura RAG y Gemini 2.5-Flash."
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints ---
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{file.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = ingest_file(file_path)
        return {"status": "ok", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query")
async def query_rag(data: dict):
    try:
        query = data.get("query")
        if not query:
            raise HTTPException(status_code=400, detail="Falta el campo 'query'")

        response = query_answer(query)

        # 🧼 Sanitizar antes de devolver
        response["answer"] = sanitize_text(response.get("answer", ""))

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clear")
async def clear_rag():
    try:
        result = clear_session()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history")
async def history():
    try:
        return get_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    """Render health check endpoint"""
    return {"status": "ok", "service": "RAG Backend - TechDocs Assistant"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
