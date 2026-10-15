/**
 * Tidies the editor's HTML for email clients before it is previewed or sent.
 *
 * The editor wraps list items and quotes in `<p>`, which the email layout
 * spaces like body paragraphs; inline margins keep those tight. An empty
 * paragraph (a blank line in the editor) collapses in most clients, so it
 * gets a line break to keep its height.
 */
export function toEmailHtml(editorHtml: string): string {
  if (typeof window === "undefined") return editorHtml;

  const doc = new DOMParser().parseFromString(
    `<body>${editorHtml}</body>`,
    "text/html",
  );

  doc.querySelectorAll("li > p").forEach((p) => {
    (p as HTMLElement).style.margin = "0";
  });
  doc.querySelectorAll("blockquote > p:last-child").forEach((p) => {
    (p as HTMLElement).style.marginBottom = "0";
  });
  doc.querySelectorAll("p:empty").forEach((p) => {
    p.appendChild(doc.createElement("br"));
  });

  return doc.body.innerHTML;
}
