import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./SideBar";
import { useRAGChat } from "../hooks/useRAGChat";
import { ragService } from "../services/ragService";
import { FiSend, FiTrash2 } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { formatResponse } from "../utils/textUtils";

export default function ChatBot() {
  const {
    query,
    setQuery,
    messages,
    setMessages,
    uploading,
    querying,
    uploadFile,
    sendQuery,
    clearChat,
    selectedDocId,
    setSelectedDocId,
    handleSelectDoc,
  } = useRAGChat();

  const [docs, setDocs] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    ragService.getDocumentList().then((docsData) => {
      setDocs(docsData);
      if (docsData.length && !selectedDocId) {
        setSelectedDocId(docsData[0].id);
        handleSelectDoc(docsData[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDocumentSelect = async (docId) => {
    setSelectedDocId(docId);
    await handleSelectDoc(docId);
    setQuery(""); // limpia input al cambiar documento
  };


  const handleUploadDocument = async (selectedFile) => {
    await uploadFile(selectedFile);
    const docList = await ragService.getDocumentList();
    setDocs(docList);
    const lastId = docList[docList.length - 1]?.id;
    setSelectedDocId(lastId);
    await handleSelectDoc(lastId);
    setQuery("");
  };

  // Eliminar documento
  const handleDeleteDocument = async (docId) => {
    const ok = window.confirm("¿Confirmas eliminar este documento? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      await ragService.deleteDocument(docId);
      const docList = await ragService.getDocumentList();
      setDocs(docList);
      // Si el documento eliminado era el seleccionado, selecciona otro
      if (selectedDocId === docId) {
        if (docList.length > 0) {
          setSelectedDocId(docList[0].id);
          await handleSelectDoc(docList[0].id);
        } else {
          setSelectedDocId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Error eliminando documento:", err);
      window.alert(err?.message || "Error al eliminar el documento");
    }
  };

  // UX: bloquea input al enviar, limpia after response
  const handleSendQuery = async () => {
    if (!query.trim() || !selectedDocId || querying) return;
    await sendQuery(query, selectedDocId);
    setQuery(""); // limpia después del response
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[600px] bg-gradient-to-tr pt-15 from-blue-100/40 via-white to-slate-100">
      <Sidebar
        docs={docs}
        selectedDocId={selectedDocId}
        onSelect={handleDocumentSelect}
        onUpload={handleUploadDocument}
        onDelete={handleDeleteDocument}
      />
      <main className="relative flex-1 flex flex-col z-0">
        {/* Subheader */}
        <div className="
          sticky top-0 z-20
          flex items-center justify-between
          px-8 py-5 gap-8
          bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200
          rounded-b-2xl
        ">
          <div className="flex flex-col">
            <span className="font-bold text-2xl text-blue-800 tracking-tight drop-shadow-lg">
              RAG Messenger
            </span>
            <span className="text-slate-500 text-lg mt-2 border-l-4 border-blue-300 pl-3">
              {selectedDocId
                ? <>
                  <span className="font-medium text-blue-500">📑 Contexto:</span>
                  &nbsp;<b>{docs.find(d => d.id === selectedDocId)?.name || "Sin selección"}</b>
                </>
                : "Selecciona un documento"}
            </span>
          </div>
          <button
            onClick={clearChat}
            className="
              flex items-center gap-2
              px-5 py-2
              bg-gradient-to-r from-red-500 via-red-600 to-rose-500
              text-white font-bold text-md
              rounded-xl shadow-md
              border-none outline-none
              transition-all duration-150
              hover:scale-105 hover:bg-gradient-to-r hover:from-red-400 hover:to-red-700
              active:scale-95
              focus:ring-2 focus:ring-red-400
            "
            aria-label="Limpiar chat"
            title="Limpiar chat"
          >
            <FiTrash2 className="text-lg" />
            Limpiar chat
          </button>
        </div>
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-8 pt-8 pb-32 bg-transparent flex flex-col gap-5 custom-scroll">
          {messages.length === 0 && (
            <div className="text-slate-400/80 text-center mt-32">
              No hay mensajes. ¡Comienza enviando tu consulta!
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} items-end`}>
              <div className={`max-w-lg px-5 py-3 rounded-2xl shadow-lg
                ${msg.type === "user"
                  ? "bg-blue-600/80 text-white ml-auto"
                  : msg.type === "assistant"
                    ? "bg-white/90 text-slate-900 backdrop-blur-md border border-slate-100"
                    : "bg-red-100 text-red-600 font-semibold"}
              `}>
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => <p className="text-md" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-blue-700" {...props} />,
                    em: ({ node, ...props }) => <em className="italic text-blue-500" {...props} />,
                    li: ({ node, ...props }) => <li className="ml-6 list-disc" {...props} />,
                  }}
                >
                  {msg.type === "assistant" ? formatResponse(msg.text) : msg.text}
                </ReactMarkdown>
                <div className="text-xs text-right text-slate-400 mt-2">
                  {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {/* Input */}
        <div className="absolute left-0 right-0 bottom-0 bg-white/85 border-t border-slate-100 flex items-center px-10 py-6 shadow-lg">
          <input
            type="text"
            placeholder="Escribe tu mensaje... (Enter para enviar)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 mr-4 px-5 py-3 rounded-full shadow focus:border-blue-500 border border-slate-200 focus:outline-none text-lg"
            disabled={querying}
            onKeyDown={e => !querying && e.key === "Enter" && handleSendQuery()}
          />
          <button
            onClick={handleSendQuery}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow flex items-center gap-2 text-lg disabled:opacity-60"
            disabled={querying || !query.trim()}
          >
            <FiSend />
            Enviar
          </button>
        </div>
      </main>
    </div>
  );
}
