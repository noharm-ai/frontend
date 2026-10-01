import { useMemo } from "react";

import { useAppSelector } from "src/store";
import { usePinnedPageArticles } from "features/knowledgeBase/HelpMode/pageArticles";

/**
 * The screen's articles in the support drawer: those of its category, then
 * those pinned to its elements that the category left out. The pinned ones
 * are only known once the help mode was switched on for the screen.
 */
export const useScreenArticles = () => {
  const list = useAppSelector((state) => state.support.knowledgeBase.list);
  const pinned = usePinnedPageArticles();

  return useMemo(() => {
    const ids = new Set(list.map((article: any) => article.id));

    return [...list, ...pinned.filter((article) => !ids.has(article.id))];
  }, [list, pinned]);
};
