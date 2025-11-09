import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.rag import ingest_file, query_answer, clear_session, get_history
import shutil

# Cargar variables de entorno (.env)
load_dotenv()
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    print(" No se encontró API_KEY.")

# Crear instancia de FastAPI
app = FastAPI(
    title="RAG Backend - TechDocs Assistant",
    version="1.0.0",
    description="Asistente técnico para documentación interna con arquitectura RAG y Gemini 2.5-Flash."
)

# Habilitar CORS (para conectar con frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #  en producción, reemplazar con dominio específico
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#  Endpoint para subir archivos
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


#  Endpoint para realizar consultas
@app.post("/query")
async def query_rag(data: dict):
    try:
        query = data.get("query")
        if not query:
            raise HTTPException(status_code=400, detail="Falta el campo 'query'")

        response = query_answer(query)
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#  Endpoint para limpiar la sesión (vector store)
@app.post("/clear")
async def clear_rag():
    try:
        result = clear_session()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#  Endpoint para listar historial de documentos procesados
@app.get("/history")
async def history():
    try:
        return get_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
