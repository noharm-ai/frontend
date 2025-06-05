const stripHtmlPreserveSpaces = (html) => {
  return html
    .replace(/<[^>]*>/g, " ") // Replace HTML tags with spaces
    .replace(/\s{2,}/g, " ") // Normalize multiple spaces to single space
    .trim(); // Remove leading/trailing spaces
};

const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export { stripHtml as default, stripHtmlPreserveSpaces };
