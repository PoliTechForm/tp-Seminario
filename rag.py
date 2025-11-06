import os
import google.generativeai as genai
import fitz  # PyMuPDF para leer PDFs
import hashlib
import numpy as np
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    raise ValueError(" No se encontró API_KEY en el archivo .env")

genai.configure(api_key=API_KEY)

VECTOR_STORE: Dict[str, Dict] = {}

def embed_text(text: str) -> List[float]:
    model = "gemini-embedding-001"
    result = genai.embed_content(model=model, content=text)
    return result["embedding"]

def ingest_file(file_path: str):
    if file_path.endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif file_path.endswith(".md"):
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    else:
        raise ValueError("Formato no soportado. Usa .md o .pdf")

    chunks = chunk_text(text)
    for chunk in chunks:
        vector = embed_text(chunk)
        key = hashlib.md5(chunk.encode()).hexdigest()
        VECTOR_STORE[key] = {"text": chunk, "embedding": vector, "source": os.path.basename(file_path)}

    return {"message": f"{len(chunks)} fragmentos procesados de {file_path}"}


# --- Extraer texto de PDF ---
def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with fitz.open(file_path) as pdf:
        for page in pdf:
            text += page.get_text()
    return text


# --- Dividir texto en trozos ---
def chunk_text(text: str, max_length: int = 500) -> List[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_length):
        chunk = " ".join(words[i:i + max_length])
        chunks.append(chunk)
    return chunks


# --- Buscar los fragmentos más similares ---
def retrieve(query: str, top_k: int = 3):
    query_vec = embed_text(query)
    similarities = []

    for key, data in VECTOR_STORE.items():
        doc_vec = np.array(data["embedding"])
        score = cosine_similarity(query_vec, doc_vec)
        similarities.append((score, data))

    similarities.sort(key=lambda x: x[0], reverse=True)
    return [d for _, d in similarities[:top_k]]


# --- Cálculo de similitud ---
def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


# --- Generar respuesta con Gemini ---
def query_answer(query: str):
    context_docs = retrieve(query)
    context_text = "\n\n".join([doc["text"] for doc in context_docs])

    prompt = f"""
Eres un asistente técnico de documentación interna.
Responde de forma precisa y cita las fuentes relevantes.

Pregunta: {query}

Contexto:
{context_text}

Responde explicando y citando las secciones o documentos usados.
"""

    model = genai.GenerativeModel("models/gemini-2.5-flash")
    response = model.generate_content(prompt)

    sources = list({doc["source"] for doc in context_docs})
    return {"answer": response.text, "sources": sources}


# --- Limpieza del contexto (opcional) ---
def clear_session():
    VECTOR_STORE.clear()
    return {"message": "Vector store limpiado"}


# --- Historial de documentos cargados ---
def get_history():
    return {"docs": list(VECTOR_STORE.keys())}
