const baseURL = "https://tp-seminario-18.onrender.com";

export const ragService = {
  async uploadFile(file) {
    const form = new FormData();
    console.log("Archivo seleccionado:", file);
    form.append("file", file);

    const response = await fetch(`${baseURL}/upload`, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Error al subir archivo: ${response.statusText}`);
    }

    return await response.json();
  },

  async sendQuery(query, documentId) {
    const response = await fetch(`${baseURL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, documentId }),
    });

    if (!response.ok) {
      throw new Error(`Error en la consulta: ${response.statusText}`);
    }

    return await response.json();
  },

  async getDocumentList() {
    const response = await fetch(`${baseURL}/documents`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`No se pudo obtener el historial: ${response.statusText}`);
    }
    return await response.json();
  },

  // NUEVO: obtener historial por documento
  async getChat(docId) {
    const response = await fetch(`${baseURL}/chat/${docId}`);
    if (!response.ok) return [];
    return await response.json();
  },

  // NUEVO: guardar mensaje chat por documento
  async postChat(docId, message) {
    await fetch(`${baseURL}/chat/${docId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  },

  // Eliminar documento por id
  async deleteDocument(docId) {
    const encoded = encodeURIComponent(docId);
    const response = await fetch(`${baseURL}/documents/${encoded}`, {
      method: "DELETE",
    });
    if (response.status === 404) {
      throw new Error("Documento no encontrado");
    }
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText || "");
      throw new Error(`No se pudo eliminar el documento: ${text}`);
    }
    return await response.json();
  }

}
