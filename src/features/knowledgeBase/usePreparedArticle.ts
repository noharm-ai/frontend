import { useMemo } from "react";

import { IArticleHeading, prepareArticleContent } from "./articleContent";

/** Sanitized article body and its h2 headings, ready to render. */
export const usePreparedArticle = (content: string | null | undefined) =>
  useMemo(
    () =>
      content
        ? prepareArticleContent(content)
        : { html: "", headings: [] as IArticleHeading[] },
    [content],
  );
