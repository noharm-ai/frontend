import { useMemo } from "react";

import { useAppSelector } from "src/store";

import { IHelpElement, IHelpElementArticle } from "./HelpModeSlice";

export interface IPageArticle extends IHelpElementArticle {
  // labels of the elements the article is pinned to
  labels: string[];
}

const NO_ELEMENTS: IHelpElement[] = [];

/**
 * The articles pinned to the elements of a screen, once each, by title
 */
export const collectPageArticles = (elements: IHelpElement[]) => {
  const byId = new Map<number, IPageArticle>();

  elements.forEach((item) =>
    item.articles.forEach((article) => {
      const entry = byId.get(article.id) ?? { ...article, labels: [] };

      if (item.label && !entry.labels.includes(item.label)) {
        entry.labels.push(item.label);
      }
      byId.set(article.id, entry);
    }),
  );

  return Array.from(byId.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
};

/**
 * The current screen's pinned articles, as far as the help mode loaded them:
 * the elements are only fetched while it is on, so this stays empty on a
 * screen it was never switched on
 */
export const usePinnedPageArticles = () => {
  const elements = useAppSelector((state) => {
    const { page, byPage } = state.helpMode;

    return (page && byPage[page]?.list) || NO_ELEMENTS;
  });

  return useMemo(() => collectPageArticles(elements), [elements]);
};
