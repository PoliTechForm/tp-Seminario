import { useState } from "react";
import { ragService } from "../services/ragService";
import { formatResponse } from "../utils/textUtils";

export function useRAGChat() {
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [querying, setQuerying] = useState(false);

  // Estado para documento seleccionado y chat por documento
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Cargar historial de chat cuando cambias documento
  const handleSelectDoc = async (docId) => {
    setSelectedDocId(docId);
    const hist = await ragService.getChat(docId);
    setMessages(hist || []);
  };

  // Subida de nuevo documento
  const uploadFile = async (file) => {
    setUploading(true);
    try {
      await ragService.uploadFile(file);
    } finally {
      setUploading(false);
    }
  };

  // Enviar consulta y persistir mensajes
  const sendQuery = async (userQuery, docId) => {
    if (!userQuery.trim() || !docId) return;
    setQuerying(true);
    // 1 - Agrega mensaje de usuario
    const userMsg = { type: "user", text: userQuery, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    await ragService.postChat(docId, userMsg);

    try {
      // 2 - Consulta al backend enviando también el documentId
      const response = await ragService.sendQuery(userQuery, docId);
      const botMsg = { type: "assistant", text: formatResponse(response), timestamp: Date.now() };
      setMessages((prev) => [...prev, botMsg]);
      await ragService.postChat(docId, botMsg);
    } finally {
      setQuerying(false);
    }
  };

  // Limpiar historial solamente del documento seleccionado
  const clearChat = async () => {
    setMessages([]);
    // Opcional: borra también en backend si agregas endpoint
  };

  return {
    query,
    setQuery,
    uploading,
    querying,
    messages,
    setMessages,
    selectedDocId,
    setSelectedDocId,
    uploadFile,
    sendQuery,
    clearChat,
    handleSelectDoc,
  };
}
