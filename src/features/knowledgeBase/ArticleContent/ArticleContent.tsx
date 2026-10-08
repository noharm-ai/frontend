import { MouseEvent, Ref, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import DefaultModal from "components/Modal";

import { IKnowledgeBaseArticle } from "../KnowledgeBaseSlice";
import {
  ArticleBody,
  ArticleHeader,
  ArticleShell,
  ImagePreview,
  StateBox,
} from "../KnowledgeBaseArticle/KnowledgeBaseArticle.style";

const WORDS_PER_MINUTE = 200;

const readingMinutes = (html: string) => {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

interface IArticleContentProps {
  article: IKnowledgeBaseArticle;
  // prepared by usePreparedArticle
  html: string;
  // a link to another article inside the body
  onOpenArticle: (id: number) => void;
  bodyRef?: Ref<HTMLDivElement>;
  className?: string;
}

/** Header and body of an article, shared by the article page and modal. */
export function ArticleContent({
  article,
  html,
  onOpenArticle,
  bodyRef,
  className,
}: IArticleContentProps) {
  const { t } = useTranslation();
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);

  const onBodyClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target.tagName === "IMG") {
      setPreviewImageSrc((target as HTMLImageElement).src);
      return;
    }

    // links to other articles stay inside the app
    const anchor = target.closest("a[data-kb-article]");
    if (anchor && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      onOpenArticle(Number(anchor.getAttribute("data-kb-article")));
    }
  };

  return (
    <ArticleShell className={className}>
      <ArticleHeader>
        {article.path.length > 0 && (
          <div className="article-tags">
            {article.path.map((p) => (
              <span key={p} className="article-tag">
                {p}
              </span>
            ))}
          </div>
        )}
        <h1>{article.title}</h1>
        {article.description && (
          <p className="article-lead">{article.description}</p>
        )}
        <div className="article-meta">
          {article.updatedAt && (
            <span>
              <CalendarOutlined />
              {t("knowledgeBase.updatedAt", {
                date: dayjs(article.updatedAt).format("DD/MM/YYYY"),
              })}
            </span>
          )}
          {article.content && (
            <span>
              <ClockCircleOutlined />
              {t("knowledgeBase.readingTime", {
                count: readingMinutes(article.content),
              })}
            </span>
          )}
        </div>
      </ArticleHeader>

      {html ? (
        <ArticleBody
          ref={bodyRef}
          onClick={onBodyClick}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <StateBox style={{ padding: "24px 0" }}>
          <strong>{t("knowledgeBase.externalOnly")}</strong>
          {article.link && (
            <Button
              type="primary"
              icon={<ExportOutlined />}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("knowledgeBase.openExternal")}
            </Button>
          )}
        </StateBox>
      )}

      <DefaultModal
        open={Boolean(previewImageSrc)}
        footer={null}
        centered
        destroyOnHidden
        width="auto"
        onCancel={() => setPreviewImageSrc(null)}
      >
        <ImagePreview src={previewImageSrc ?? undefined} alt="" />
      </DefaultModal>
    </ArticleShell>
  );
}
