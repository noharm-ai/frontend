import DOMPurify from "dompurify";

import { IKnowledgeBaseArticleSummary } from "./KnowledgeBaseSlice";

export interface IArticleHeading {
  id: string;
  text: string;
}

// the only embeds the articles carry are YouTube videos
const ALLOWED_IFRAME_SRC =
  /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//;

export const articlePath = (id: number) => `/base-de-conhecimento/${id}`;

// the migrated content still links to the old (external) copies of the
// articles; compare them without protocol, query, hash or trailing slash
const normalizeLink = (link: string) => {
  try {
    const url = new URL(link);
    return `${url.host}${url.pathname}`.replace(/\/+$/, "").toLowerCase();
  } catch {
    return null;
  }
};

export const buildLinkIndex = (articles: IKnowledgeBaseArticleSummary[]) => {
  const index = new Map<string, number>();

  articles.forEach((article) => {
    const key = article.link ? normalizeLink(article.link) : null;
    if (key) index.set(key, article.id);
  });

  return index;
};

/**
 * Sanitize an article body and prepare it for the reader:
 * - h2 headings get ids, feeding the table of contents;
 * - links to the old copy of another article point to its page here;
 * - every other link opens in a new tab;
 * - YouTube embeds get a responsive wrapper, any other iframe is dropped.
 */
export const prepareArticleContent = (
  html: string,
  linkIndex: Map<string, number>,
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
    const href = anchor.getAttribute("href") ?? "";
    const key = normalizeLink(href);
    const articleId = key ? linkIndex.get(key) : undefined;

    if (articleId) {
      anchor.setAttribute("href", articlePath(articleId));
      anchor.setAttribute("data-kb-article", String(articleId));
      anchor.removeAttribute("target");
    } else {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  });

  // rebuilt from scratch: only an allowed src survives, never other attributes
  body.querySelectorAll("iframe").forEach((iframe) => {
    const src = iframe.getAttribute("src") ?? "";
    if (!ALLOWED_IFRAME_SRC.test(src)) {
      iframe.remove();
      return;
    }

    const video = document.createElement("iframe");
    video.setAttribute("src", src);
    video.setAttribute("title", iframe.getAttribute("title") || "video");
    video.setAttribute(
      "allow",
      "accelerometer; encrypted-media; gyroscope; picture-in-picture",
    );
    video.setAttribute("allowfullscreen", "true");

    const wrapper = document.createElement("div");
    wrapper.className = "kb-video";
    wrapper.appendChild(video);
    iframe.replaceWith(wrapper);
  });

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
