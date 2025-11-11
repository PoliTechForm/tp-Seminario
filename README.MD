# 💻 Asistente Técnico RAG para Empresa de Software

### Proyecto Final para la materia: S.A.C. - Modelos y Aplicaciones de la Inteligencia Artificial.

**Instituto: IPF "Dr. Alberto Marcelo Zerrilla"**

**Integrantes del equipo:**
Ortiz Emilio
Roa Luciano
Ortega Marceelo
Britez Milagros

## Descripción del Proyecto

Este proyecto consiste en un asistente de documentación técnica basado en la arquitectura RAG (Retrieval-Augmented Generation).
Para actuar como un Asistente Técnico Virtual o “Tech Lead IA” dentro de una empresa de desarrollo de software.

Su función es ayudar a los desarrolladores a comprender la arquitectura interna, guías de estilo y procedimientos técnicos de la organización, respondiendo preguntas en lenguaje natural sobre la documentación interna.

El asistente puede procesar archivos en formato PDF o Markdown (.md) —por ejemplo, README.md, guías de despliegue, manuales de estilo o documentos de arquitectura— y responder preguntas como:

- **_“¿Cómo funciona el servicio de notificaciones?”_**
- **_“¿Cuál es la estructura de carpetas del microservicio de usuarios?”_**
- **_“¿Qué buenas prácticas se recomiendan para el desarrollo de APIs?”_**

## Demo

A continuación se muestra el asistente en funcionamiento, respondiendo una consulta técnica sobre un documento de arquitectura:

## Caso de Uso: Problema y Solución

- **El Problema:**
  Un nuevo desarrollador ingresa al equipo y necesita entender cómo funcionan los sistemas internos, pero la documentación es extensa y dispersa. Leer múltiples README, manuales y guías puede ser lento y confuso.

- **La Solución:** El Asistente Técnico RAG procesa los documentos internos de la empresa (por ejemplo, README.md, Guías de Despliegue, Manuales de Estilo y Documentos de Arquitectura), crea una base de conocimiento vectorial y permite al usuario preguntar directamente sobre el contenido.

- **Requisito Cumplido:** El sistema utiliza la arquitectura RAG para recuperar fragmentos relevantes de los documentos y generar respuestas precisas, citando el documento utilizado.

- **Requisito Cumplido:**
  Cada respuesta del asistente incluye la fuente documental utilizada, por ejemplo:

**_“Según el archivo Guía de Despliegue.md...”_**

## Stack Tecnológico

**Arquitectura:** Retrieval-Augmented Generation (RAG)

**Framework RAG:** LangChain

**Base de Datos Vectorial:** ChromaDB (persistente)

**Modelo de Embeddings:** nomic-embed-text (Ollama)

**Modelo de Lenguaje (LLM):** Gemini 2.5 Flash (Google Vertex AI)

**Backend:** FastAPI + Uvicorn

**Frontend:** Streamlit

**Lenguaje:** Python
