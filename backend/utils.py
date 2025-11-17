from langchain_core.prompts import ChatPromptTemplate

prompt_template = ChatPromptTemplate.from_messages([
    (
        "system",
        """
Eres un asistente técnico encargado de responder preguntas sobre documentos internos.
Responde solo si {context} posee contenido. 
Si el contexto está vacío, responde con algo como:
"No tengo suficiente información para responder esa pregunta."
"""
    ),
    ("ai", "{ai_msg}"),
    ("human", "{human_msg}")
])


def build_prompt_dict(context, user_input, ai_msg=""):
    return {
        "context": context,
        "ai_msg": ai_msg,
        "human_msg": user_input
    }
