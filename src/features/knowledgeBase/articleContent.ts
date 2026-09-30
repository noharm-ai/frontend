import DOMPurify from "dompurify";

export interface IArticleHeading {
  id: string;
  text: string;
}

// the only embeds the articles carry are YouTube videos
const ALLOWED_IFRAME_SRC =
  /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//;

export const articlePath = (id: number) => `/base-de-conhecimento/${id}`;

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
