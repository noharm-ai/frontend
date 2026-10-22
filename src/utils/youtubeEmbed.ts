import DOMPurify from "dompurify";

// the only embeds rich text may carry are YouTube videos
const ALLOWED_IFRAME_SRC =
  /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//;

/**
 * Replace every iframe under `root` with a YouTube player wrapped in a
 * `wrapperClass` div. Iframes are rebuilt from scratch: only an allowed src
 * survives, never other attributes. Any other iframe is dropped.
 */
export const rebuildYoutubeEmbeds = (
  root: ParentNode,
  wrapperClass: string,
) => {
  root.querySelectorAll("iframe").forEach((iframe) => {
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
    wrapper.className = wrapperClass;
    wrapper.appendChild(video);
    iframe.replaceWith(wrapper);
  });
};

/**
 * Sanitize rich text for display, keeping its YouTube embeds as players.
 */
export const sanitizeWithYoutubeEmbeds = (
  html: string,
  wrapperClass: string,
) => {
  const body = DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    RETURN_DOM: true,
  }) as HTMLElement;

  rebuildYoutubeEmbeds(body, wrapperClass);

  // re-parsing serialized markup can differ from the DOM it came from:
  // sanitize the final string too, allowing only what was added above
  return DOMPurify.sanitize(body.innerHTML, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen"],
  });
};
