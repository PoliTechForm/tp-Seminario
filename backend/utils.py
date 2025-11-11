import re
from typing import List
from PyPDF2 import PdfReader
import markdown
from io import StringIO

def extract_text_from_pdf(path: str) -> str:
    reader = PdfReader(path)
    texts = []
    for i, page in enumerate(reader.pages):
        texts.append((i, page.extract_text() or ""))
    # return list of (page_index, text)
    return "\n".join([t for _, t in texts])

def extract_text_from_md(path: str) -> str:
    # Extrae texto de un .md manteniendo títulos como separadores.
    with open(path, 'r', encoding='utf-8') as f:
        raw = f.read()
    # opcional: convertir markdown a texto simple (strip HTML)
    html = markdown.markdown(raw)
    # remover tags HTML para obtener texto simple
    text = re.sub('<[^<]+?>', '', html)
    return text

def simple_chunk_text(text: str, max_chars: int = 1000) -> List[str]:
    # Normalize whitespace and split by double newline (paragraphs)
    text = re.sub(r'\r\n', '\n', text)
    paragraphs = [p.strip() for p in re.split(r'\n{2,}', text) if p.strip()]
    chunks = []
    current = ""
    for p in paragraphs:
        if len(current) + len(p) + 1 <= max_chars:
            current = f"{current}\n\n{p}".strip()
        else:
            if current:
                chunks.append(current)
            if len(p) > max_chars:
                # split long paragraph
                for i in range(0, len(p), max_chars):
                    chunks.append(p[i:i+max_chars])
                current = ""
            else:
                current = p
    if current:
        chunks.append(current)
    return chunks
