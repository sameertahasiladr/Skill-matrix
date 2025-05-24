import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Converts Markdown to sanitized HTML.
 */
export async function parseMarkdown(markdownText: string): Promise<string> {
  if (!markdownText) return "";
  const dirtyHtml: string = await marked(markdownText); // Convert Markdown to HTML
  return DOMPurify.sanitize(dirtyHtml); // Sanitize the HTML output
}
