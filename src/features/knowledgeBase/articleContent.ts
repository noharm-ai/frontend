import DOMPurify from "dompurify";

import { rebuildYoutubeEmbeds } from "utils/youtubeEmbed";

export interface IArticleHeading {
  id: string;
  text: string;
}

export const KNOWLEDGE_BASE_PATH = "/base-de-conhecimento";

export const articlePath = (id: number) => `${KNOWLEDGE_BASE_PATH}/${id}`;

// a link written as /base-de-conhecimento/<id> points to another article
const ARTICLE_HREF = /^\/base-de-conhecimento\/(\d+)\/?(?:[?#].*)?$/;

/**
 * Sanitize an article body and prepare it for the reader:
 * - h2 headings get ids, feeding the table of contents;
 * - links to another article (/base-de-conhecimento/<id>) stay in the app;
 * - every other link opens in a new tab;
 * - YouTube embeds get a responsive wrapper, any other iframe is dropped.
 */
export const prepareArticleContent = (
  html: string,
): { html: string; headings: IArticleHeading[] } => {
  const body = DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    RETURN_DOM: true,
  }) as HTMLElement;

  const headings: IArticleHeading[] = [];
  body.querySelectorAll("h2").forEach((heading, index) => {
    const text = heading.textContent?.trim();
    if (!text) return;

    const id = `secao-${index + 1}`;
    heading.id = id;
    headings.push({ id, text });
  });

  body.querySelectorAll("a[href]").forEach((anchor) => {
    const match = (anchor.getAttribute("href") ?? "").match(ARTICLE_HREF);

    if (match) {
      anchor.setAttribute("data-kb-article", match[1]);
      anchor.removeAttribute("target");
    } else {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  });

  rebuildYoutubeEmbeds(body, "kb-video");

  // re-parsing serialized markup can differ from the DOM it came from:
  // sanitize the final string too, allowing only what was added above
  const safeHtml = DOMPurify.sanitize(body.innerHTML, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["target", "allow", "allowfullscreen"],
  });

  return { html: safeHtml, headings };
};

// accent-insensitive, for the instant filter while typing
export const normalizeText = (text: string | null | undefined) =>
  (text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
