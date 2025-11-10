import React, { useState } from "react";

// Use VITE_API_URL if provided (recommended), otherwise fallback to the deployed Render domain
const baseURL = "https://tp-seminario.onrender.com";

function sanitizeText(text) {
  if (typeof text !== "string") return "";
  // Eliminar etiquetas HTML, caracteres peligrosos o scripts
  return text
    .replace(/<[^>]*>?/gm, "") // quita HTML
    .replace(/&[a-z]+;/gi, "") // quita entidades HTML
    .replace(/[^\x20-\x7E\n\r\t]/g, ""); // elimina caracteres no imprimibles
}

export default function RAGDemo() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [querying, setQuerying] = useState(false);

  const Subir = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${baseURL}/upload`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      setAnswer({ status: "uploaded", info: json });
    } catch (err) {
      setAnswer({ error: err?.message ?? String(err) });
    } finally {
      setUploading(false);
    }
  };

  const Consultar = async () => {
    if (!query)
      return setAnswer({ error: "Escribe una pregunta antes de consultar." });
    try {
      setQuerying(true);
      const res = await fetch(`${baseURL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      setAnswer(json);
    } catch (err) {
      setAnswer({ error: err?.message ?? String(err) });
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-500  flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Demo RAG</h1>

        <div className="flex flex-col gap-4">
          <label className="inline-flex items-center gap-3">
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <span className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-blue-700">
              Seleccionar archivo
            </span>
          </label>

          <div className="text-sm text-slate-500">
            {file ? `Archivo: ${file.name}` : "No hay archivo seleccionado"}
          </div>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!file || uploading}
              onClick={Subir}
            >
              {uploading ? "Subiendo..." : "Subir"}
            </button>

            <div className="flex-1" />
          </div>

          <hr />

          <input
            className="w-full px-3 py-2 rounded-md border border-slate-200"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe tu pregunta aquí"
          />

          <div className="flex gap-2 justify-center ">
            <button
              className="px-4 py-2 rounded-md font-semibold  bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={querying}
              onClick={Consultar}
            >
              {querying ? "Consultando..." : "Consultar"}
            </button>

            <button
              className="px-4 py-2 rounded-md font-semibold border border-slate-200 bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setQuery("");
                setAnswer(null);
              }}
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-md overflow-auto max-h-80 whitespace-pre-wrap">
          {answer
            ? sanitizeText(
                answer.text ?? answer.answer ?? JSON.stringify(answer)
              )
            : "(sin respuesta)"}
        </div>
      </div>
    </div>
  );
}
