import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { ReadOutlined, SearchOutlined } from "@ant-design/icons";

import DefaultModal from "components/Modal";

import { KNOWLEDGE_BASE_PATH } from "../../articleContent";
import { IHelpElement } from "../HelpModeSlice";
import { collectPageArticles } from "../pageArticles";
import { HELP_LAYER_Z_INDEX } from "../HelpModeLayer/HelpModeLayer.style";
import { ArticleList, ListHint } from "./HelpModePageArticles.style";

interface IHelpModePageArticlesProps {
  // every element of the screen, visible or not
  elements: IHelpElement[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenArticle: (id: number) => void;
}

/**
 * Every article pinned on the screen, once each, by title: the way in for
 * help on elements not on screen right now (a closed tab or modal), and to
 * the knowledge base for anything else
 */
export function HelpModePageArticles({
  elements,
  open,
  onOpenChange,
  onOpenArticle,
}: IHelpModePageArticlesProps) {
  const { t } = useTranslation();

  const articles = useMemo(() => collectPageArticles(elements), [elements]);

  if (articles.length === 0) return null;

  const close = () => onOpenChange(false);

  return (
    <>
      <Button
        size="small"
        icon={<ReadOutlined />}
        onClick={() => onOpenChange(true)}
      >
        {t("helpMode.pageArticles", { count: articles.length })}
      </Button>

      <DefaultModal
        open={open}
        title={t("helpMode.pageArticlesTitle")}
        width={640}
        // over the help mode's highlights
        zIndex={HELP_LAYER_Z_INDEX + 10}
        destroyOnHidden
        onCancel={close}
        footer={
          <>
            <Button
              type="link"
              icon={<SearchOutlined />}
              href={KNOWLEDGE_BASE_PATH}
              target="_blank"
              rel="noopener noreferrer"
              style={{ float: "left", paddingInline: 0 }}
            >
              {t("helpMode.searchKnowledgeBase")}
            </Button>
            <Button onClick={close}>{t("knowledgeBase.close")}</Button>
          </>
        }
      >
        <ListHint>{t("helpMode.pageArticlesHint")}</ListHint>
        <ArticleList>
          {articles.map((article) => (
            <li key={article.id}>
              <button
                type="button"
                onClick={() => {
                  close();
                  onOpenArticle(article.id);
                }}
              >
                <strong>{article.title}</strong>
                {article.description && <span>{article.description}</span>}
                {article.labels.length > 0 && (
                  <small>
                    {t("helpMode.pageArticlesWhere", {
                      labels: article.labels.join(", "),
                    })}
                  </small>
                )}
              </button>
            </li>
          ))}
        </ArticleList>
      </DefaultModal>
    </>
  );
}
