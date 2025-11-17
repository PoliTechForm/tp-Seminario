import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader, UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
import google.generativeai as genai

load_dotenv()
API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise ValueError("No se encontró API_KEY")
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

vectorstores = {}   
retrievers = {}       
document_sources = {} 

def ingest_file(file_path: str):
    ext = file_path.lower()
    if ext.endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    elif ext.endswith(".md"):
        loader = UnstructuredMarkdownLoader(file_path)
    else:
        raise ValueError("Formato no soportado: usa .pdf o .md")

    docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=320,
        chunk_overlap=60
    )
    chunks = splitter.split_documents(docs)
    doc_id = os.path.basename(file_path)
    document_sources[doc_id] = {
        "file_path": file_path,
        "num_chunks": len(chunks)
    }
    for c in chunks:
        c.metadata["source"] = doc_id

    vectorstore = FAISS.from_documents(chunks, embeddings)
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 8}
    )
    vectorstores[doc_id] = vectorstore
    retrievers[doc_id] = retriever
    return {"status": "ok", "chunks": len(chunks), "doc": doc_id}

def retrieve_chunks(query: str, documentId: str):
    retriever = retrievers.get(documentId)
    if retriever is None:
        return []
    docs = retriever.invoke(query)
    return [d for d in docs if d.metadata.get("source") == documentId][:8]

def query_answer(query: str, documentId: str):
    chunks = retrieve_chunks(query, documentId)
    if not chunks:
        return {
            "answer": "No encontré información relacionada a esa pregunta en el documento. Probá reformularla.",
            "sources": []
        }
    context = "\n\n".join([c.page_content for c in chunks])
    prompt = f"""
Respondé usando exclusivamente el siguiente contexto... 
Contexto:
{context}
Pregunta:
{query}
"""
    result = llm.invoke(prompt)
    sources = list({c.metadata["source"] for c in chunks})
    return {
        "answer": result.content,
        "sources": sources
    }


def clear_session():
    global vectorstores, retrievers, document_sources
    vectorstores = {}
    retrievers = {}
    document_sources = {}
    return {"message": "Vector store limpiado"}

def get_history():
    return {"docs": list(document_sources)}
