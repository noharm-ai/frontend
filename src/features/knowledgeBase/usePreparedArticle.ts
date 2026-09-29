import { useEffect, useMemo } from "react";

import { useAppDispatch, useAppSelector } from "src/store";

import { fetchKnowledgeBaseArticles } from "./KnowledgeBaseSlice";
import {
  buildLinkIndex,
  IArticleHeading,
  prepareArticleContent,
} from "./articleContent";

/**
 * Sanitized article body and its h2 headings, ready to render. `active`
 * false skips loading the article list, for a reader mounted while hidden.
 */
export const usePreparedArticle = (
  content: string | null | undefined,
  active = true,
) => {
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.knowledgeBase.list);

  useEffect(() => {
    // the list resolves links between articles
    if (active && list.status === "idle") {
      dispatch(fetchKnowledgeBaseArticles());
    }
  }, [dispatch, active, list.status]);

  const linkIndex = useMemo(() => buildLinkIndex(list.data), [list.data]);

  return useMemo(
    () =>
      content
        ? prepareArticleContent(content, linkIndex)
        : { html: "", headings: [] as IArticleHeading[] },
    [content, linkIndex],
  );
};
