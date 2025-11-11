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


## Stack Tecnológico

**Arquitectura:** Retrieval-Augmented Generation (RAG)

**Framework RAG:** LangChain

**Base de Datos Vectorial:** Vector-Store

**Modelo de Embeddings:** text-embeding-004

**Modelo de Lenguaje (LLM):** Gemini 2.5 Flash 
(Google Vertex AI)
**Librerias Princiales** google-generativeai, langchain_community,dotenv, PyPDF2, markdown

**Backend:** FastAPI + Uvicorn

**Frontend:** React

**Lenguaje:** Python

## Instalacion 

**1. Clonar el Repositorio:**

```bash 
git clone https://github.com/PoliTechForm/tp-Seminario.git
```
**2.Moverse a la carpeta backend :**
```bash 
cd backend
```
**3. Crear y activar Entorno virtual:**

```bash 
python -m venv venv
```
```bash 
# Activar en Windows
.\venv\Scripts\activate

# Activar en macOS/Linux
source venv/bin/activate
```
**3. Instalar dependencias:**
```bash
pip install -r requirements.txt
```
**4. Configurar Modelos y Credenciales (Gemini y Ollama):**

* **Google AI (LLM - API Key):** El proyecto utiliza la clave API de Google AI Studio (no de Google Cloud).
    1.  Crea un archivo llamado **`.env`** en la raíz del proyecto.
    2.  Añade tu clave al archivo, siguiendo este formato:
        ```text
        API_KEY="TU_CLAVE_API_VA_AQUI"
        ```



## Ejutar el frontend

**1. En la terminal ejecuta.**

```bash
cd frontend
```
**1. Instalar las dependencias.**

```bash
npm i 
```
**1. Ejecutar el Frontend.**
```bash
npm run dev
```