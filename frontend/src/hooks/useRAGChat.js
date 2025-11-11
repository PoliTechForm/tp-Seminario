import { useState } from "react";
import { ragService } from "../services/ragService";
import { formatResponse } from "../utils/textUtils";

export function useRAGChat() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [querying, setQuerying] = useState(false);

  const addMessage = (type, text) => {
    setMessages((prev) => [
      ...prev,
      {
        type,
        text,
        timestamp: new Date(),
      },
    ]);
  };

  const uploadFile = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const response = await ragService.uploadFile(file);
      
      addMessage(
        "system",
        `Archivo "${file.name}" subido correctamente. ${response.message || ""}`
      );
    } catch (err) {
      addMessage("error", `Error al subir archivo: ${err?.message ?? String(err)}`);
    } finally {
      setUploading(false);
    }
  };

  const sendQuery = async () => {
    if (!query.trim()) return;

    const userQuery = query;
    addMessage("user", userQuery);
    setQuery("");

    try {
      setQuerying(true);
      const response = await ragService.sendQuery(userQuery);
      
      addMessage("assistant", formatResponse(response));
    } catch (err) {
      addMessage("error", `Error: ${err?.message ?? String(err)}`);
    } finally {
      setQuerying(false);
    }
  };

  const clearChat = () => {
    setQuery("");
    setMessages([]);
  };

  return {
    file,
    query,
    messages,
    uploading,
    querying,
    setFile,
    setQuery,
    uploadFile,
    sendQuery,
    clearChat,
  };
}
