import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

vectorstores = {}
retrievers = {}
document_sources = {}


def get_llm_and_embeddings():
    from langchain_google_genai import (
        GoogleGenerativeAIEmbeddings,
        ChatGoogleGenerativeAI
    )
    import google.generativeai as genai

    API_KEY = os.getenv("API_KEY")
    if not API_KEY:
        raise RuntimeError("API_KEY no configurada en Render")

    genai.configure(api_key=API_KEY)

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=API_KEY
    )

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=API_KEY,
        temperature=0.2
    )

    return llm, embeddings


# ---------- INGEST ----------
def ingest_file(file_path: str):
    _, embeddings = get_llm_and_embeddings()

    loader = PyPDFLoader(file_path)
    docs = loader.load()

    if not docs or all(not d.page_content.strip() for d in docs):
        raise ValueError(
            "El PDF no contiene texto legible (posible PDF escaneado)"
        )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=320,
        chunk_overlap=60
    )
    chunks = splitter.split_documents(docs)

    if not chunks:
        raise ValueError("No se pudo dividir el contenido del PDF")

    doc_id = os.path.basename(file_path)
    document_sources[doc_id] = {"chunks": len(chunks)}

    for c in chunks:
        c.metadata["source"] = doc_id

    vectorstore = FAISS.from_documents(chunks, embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 8})

    vectorstores[doc_id] = vectorstore
    retrievers[doc_id] = retriever

    return {"doc": doc_id, "chunks": len(chunks)}


# ---------- QUERY ----------
def query_answer(query: str, documentId: str):
    llm, _ = get_llm_and_embeddings()

    retriever = retrievers.get(documentId)
    if not retriever:
        return {
            "answer": "Documento no encontrado",
            "sources": []
        }

    docs = retriever.invoke(query)
    context = "\n\n".join(d.page_content for d in docs)

    prompt = f"""
Respondé usando solo el siguiente contexto.

Contexto:
{context}

Pregunta:
{query}
"""

    result = llm.invoke(prompt)

    return {
        "answer": result.content,
        "sources": [documentId]
    }


# ---------- CLEAR ----------
def clear_session():
    vectorstores.clear()
    retrievers.clear()
    document_sources.clear()
    return {"message": "Vector store limpiado"}
