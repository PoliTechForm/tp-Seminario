export function sanitizeText(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/<[^>]*>?/gm, "")
    .replace(/&[a-z]+;/gi, "")
    .replace(/[^\x20-\x7E\n\r\t]/g, "");
}

export function formatResponse(response) {
  return sanitizeText(response.text ?? response.answer ?? JSON.stringify(response));
}
