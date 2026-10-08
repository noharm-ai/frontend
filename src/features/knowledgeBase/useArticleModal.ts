import { useCallback } from "react";

import { useAppDispatch } from "src/store";

import { closeArticleModal, openArticleModal } from "./KnowledgeBaseSlice";

/**
 * Open a knowledge base article in a modal, from anywhere in the app:
 *
 *   const { openArticle } = useArticleModal();
 *   openArticle(42);
 *
 * The modal itself (KnowledgeBaseArticleModal) is mounted once, app-wide.
 */
export const useArticleModal = () => {
  const dispatch = useAppDispatch();

  const openArticle = useCallback(
    (id: number) => dispatch(openArticleModal(id)),
    [dispatch],
  );
  const closeArticle = useCallback(
    () => dispatch(closeArticleModal()),
    [dispatch],
  );

  return { openArticle, closeArticle };
};
