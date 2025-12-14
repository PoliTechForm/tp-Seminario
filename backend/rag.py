import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

load_dotenv()

# =====================
# GLOBAL STATE (ephemeral)
# =====================
vectorstores = {}
retrievers = {}
document_sources = {}

_llm = None
_embeddings = None

# =====================
# LLM + EMBEDDINGS (singleton)
# =====================
def get_llm_and_embeddings():
    global _llm, _embeddings

    if _llm and _embeddings:
        return _llm, _embeddings

    from langchain_google_genai import (
        GoogleGenerativeAIEmbeddings,
        ChatGoogleGenerativeAI
    )
    import google.generativeai as genai

    API_KEY = os.getenv("API_KEY")
    if not API_KEY:
        raise RuntimeError("API_KEY no configurada en Render")

    genai.configure(api_key=API_KEY)

    _embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=API_KEY
    )

    _llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=API_KEY,
        temperature=0.2
    )

    return _llm, _embeddings

# =====================
# INGEST
# =====================
def ingest_file(file_path: str):
    _, embeddings = get_llm_and_embeddings()

    loader = PyPDFLoader(file_path)
    docs = loader.load()

    if not docs or all(not d.page_content.strip() for d in docs):
        raise ValueError("El PDF no contiene texto legible")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=320,
        chunk_overlap=60
    )
    chunks = splitter.split_documents(docs)

    if not chunks:
        raise ValueError("No se pudo dividir el PDF")

    doc_id = os.path.basename(file_path)

    for c in chunks:
        c.metadata["source"] = doc_id

    vectorstore = FAISS.from_documents(chunks, embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 8})

    vectorstores[doc_id] = vectorstore
    retrievers[doc_id] = retriever
    document_sources[doc_id] = {
        "chunks": len(chunks)
    }

    return {
        "doc": doc_id,
        "chunks": len(chunks)
    }

# =====================
# QUERY
# =====================
def query_answer(query: str, documentId: str):
    llm, _ = get_llm_and_embeddings()

    retriever = retrievers.get(documentId)
    if not retriever:
        return {
            "answer": "Documento no encontrado",
            "sources": []
        }

    docs = retriever.invoke(query)

    context = "\n\n".join(
        d.page_content for d in docs if d.page_content
    )

    prompt = f"""
Respondé usando solo el siguiente contexto.

Contexto:
{context}

Pregunta:
{query}
""".strip()

    result = llm.invoke(prompt)

    return {
        "answer": result.content,
        "sources": [documentId]
    }

# =====================
# CLEAR
# =====================
def clear_session():
    vectorstores.clear()
    retrievers.clear()
    document_sources.clear()

    return {
        "message": "Vector store limpiado",
        "storage": "ephemeral"
    }
