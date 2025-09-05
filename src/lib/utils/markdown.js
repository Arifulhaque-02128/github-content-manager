import createDOMPurify from 'dompurify';
import { marked } from 'marked';

const DOMPurify = typeof window !== "undefined" ? createDOMPurify(window) : null;

function renderMarkdown(markdown) {
  const rawHtml = marked(markdown, { breaks: true });
  return DOMPurify ? DOMPurify.sanitize(rawHtml) : rawHtml;
}

export default renderMarkdown;