import React, { useRef } from "react";
import { HiMiniFolder } from "react-icons/hi2";
import { FiUpload } from "react-icons/fi";
import { HiDocumentText } from "react-icons/hi";

export default function Sidebar({ docs, selectedDocId, onSelect, onUpload }) {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const fileName = selectedFile.name.toLowerCase();
    const validExtensions = [".pdf", ".md"];
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
    if (!isValidFile) {
      alert("Solo se permiten archivos PDF o Markdown (.md)");
      return;
    }
    onUpload(selectedFile);
  };

  return (
    <aside
      className="
        w-72 h-full pt-5
        bg-gradient-to-br from-white/80 via-slate-100/80 to-blue-50/80
        border-r border-slate-200 shadow-2xl
        flex flex-col px-6 pb-7
        z-30
      "
    >
      <div className="mb-7">
        <div className="flex flex-col gap-2">
          <span className="font-medium text-slate-500 text-md mb-2 tracking-tight">Cargar un documento nuevo</span>
          <button
            type="button"
            onClick={handleButtonClick}
            className="
              flex items-center gap-0
              bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500
              text-white font-semibold px-4 py-1 rounded-xl shadow-md
              hover:scale-105 hover:bg-gradient-to-r hover:from-blue-700 hover:to-cyan-600
              transition active:scale-95
              focus:ring-2 focus:ring-blue-300
            "
          >
            <FiUpload className="text-2xl" />
            Selecciona un documento
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.md"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mb-2">
          <HiMiniFolder className="text-2xl text-blue-700 rounded-full bg-blue-100" />
          <span className="font-semibold text-lg text-slate-700 tracking-wide">Mis Documentos</span>
        </div>
      <ul className="flex-1 space-y-2 overflow-y-auto custom-scroll">
        {(!docs || docs.length === 0) && (
          <li className="text-slate-400 text-md">Sin documentos</li>
        )}
        {docs.map((doc) => (
          <li
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            title={doc.name}
            className={`flex items-center gap-3 group
              cursor-pointer px-4 py-1 rounded-xl
              font-medium
              transition-all
              border border-transparent
              ${selectedDocId === doc.id
                ? "bg-blue-600 text-white shadow-lg border-blue-400"
                : "hover:bg-slate-100 hover:border-blue-200"}
            `}
          >
            <HiDocumentText className={`text-2xl ${selectedDocId === doc.id ? "text-white" : "text-blue-700 group-hover:text-blue-800"}`} />
            <span className="truncate group-hover:underline">{doc.name}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
