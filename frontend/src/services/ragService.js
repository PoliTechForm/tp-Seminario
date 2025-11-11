const baseURL = "https://tp-seminario.onrender.com";

export const ragService = {
  async uploadFile(file) {
    const form = new FormData();
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

  async sendQuery(query) {
    const response = await fetch(`${baseURL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error(`Error en la consulta: ${response.statusText}`);
    }
    
    return await response.json();
  },
};
