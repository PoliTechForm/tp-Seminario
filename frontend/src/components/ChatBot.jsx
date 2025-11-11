import ReactMarkdown from "react-markdown";
import { useRAGChat } from "../hooks/useRAGChat";

export default function ChatBot() {
  const {
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
  } = useRAGChat();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    const validExtensions = ['.pdf', '.md', '.txt'];
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext)) || 
                       fileName === 'readme' || 
                       fileName.startsWith('readme.');

    if (!isValidFile) {
      alert('Solo se permiten archivos PDF, Markdown (.md) o README');
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  return (
    <div className="min-h-screen bg-white pt-20 px-6 pb-6">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-6 flex flex-col h-[calc(100vh-6rem)]">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Demo RAG - Chat</h1>

        {/* Sección de carga de archivo */}
        <div className="flex flex-col gap-3 pb-4 border-b border-slate-200">
          <label className="inline-flex items-center gap-3">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.md,.txt"
              onChange={handleFileChange}
            />
            <span className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-blue-700">
              Seleccionar archivo (PDF, MD, README)
            </span>
          </label>

          <div className="text-sm text-slate-500">
            {file ? `Archivo: ${file.name}` : "No hay archivo seleccionado"}
          </div>

          <button
            className="px-4 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!file || uploading}
            onClick={uploadFile}
          >
            {uploading ? "Subiendo..." : "Subir"}
          </button>
        </div>

        {/* Área de mensajes del chat */}
        <div className="flex-1 overflow-y-auto my-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 mt-8">
              No hay mensajes aún. Sube un archivo y haz una pregunta.
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    msg.type === "user"
                      ? "bg-blue-600 text-white"
                      : msg.type === "assistant"
                      ? "bg-slate-100 text-slate-900"
                      : msg.type === "system"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {msg.type === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                  )}
                  <div
                    className={`text-xs mt-1 ${
                      msg.type === "user" ? "text-blue-200" : "text-slate-500"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input de consulta */}
        <div className="flex gap-2 pt-4 border-t border-slate-200">
          <input
            className="flex-1 px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !querying && sendQuery()}
            placeholder="Escribe tu pregunta aquí..."
            disabled={querying}
          />

          <button
            className="px-4 py-2 rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={querying || !query.trim()}
            onClick={sendQuery}
          >
            {querying ? "..." : "Enviar"}
          </button>

          <button
            className="px-4 py-2 rounded-md font-semibold border border-slate-200 bg-slate-200 text-slate-800 hover:bg-slate-300"
            onClick={clearChat}
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
