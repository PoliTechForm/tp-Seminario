export function sanitizeText(text) {
  if (typeof text !== "string") return "";

  return text
    .replace(/<[^>]*>?/gm, "")
    .replace(/&[a-z]+;/gi, "")
    .replace(/\\n\\n/g, "\n\n")
    .replace(/\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/^"(.*)"$/, "$1")
    .trim();
}

export function htmlToMarkdown(str) {
  let r = str.replace(/<b>(.*?)<\/b>/g, '**$1**');
  r = r.replace(/<i>(.*?)<\/i>/g, '*$1*');
  r = r.replace(/<br\s*\/?>/gi, "\n");

  return r;
}

export function formatResponse(response) {
  const text = sanitizeText(response.text ?? response.answer ?? JSON.stringify(response));
  return htmlToMarkdown(text);
}
