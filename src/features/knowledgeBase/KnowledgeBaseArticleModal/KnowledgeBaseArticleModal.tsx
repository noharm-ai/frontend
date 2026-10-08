import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useStore } from "react-redux";
import { Button, Skeleton } from "antd";
import { ExportOutlined } from "@ant-design/icons";

import { IRootState, useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import {
  trackKnowledgeBaseAction,
  TrackedKnowledgeBaseAction,
} from "utils/tracker";

import {
  closeArticleModal,
  fetchKnowledgeBaseModalArticle,
  openArticleModal,
} from "../KnowledgeBaseSlice";
import { articlePath } from "../articleContent";
import { usePreparedArticle } from "../usePreparedArticle";
import { ArticleContent } from "../ArticleContent/ArticleContent";
import { ArticleRelated } from "../ArticleRelated/ArticleRelated";
import { StateBox } from "../KnowledgeBaseArticle/KnowledgeBaseArticle.style";
import { ModalRelated, ModalScroll } from "./KnowledgeBaseArticleModal.style";

/**
 * App-wide article modal. Mounted once; open it with useArticleModal() or by
 * dispatching openArticleModal(id).
 */
export function KnowledgeBaseArticleModal() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { articleId, status, data } = useAppSelector(
    (state) => state.knowledgeBase.modal,
  );
  const store = useStore<IRootState>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (articleId === null) return;

    scrollRef.current?.scrollTo({ top: 0 });
    dispatch(fetchKnowledgeBaseModalArticle(articleId));
    trackKnowledgeBaseAction(TrackedKnowledgeBaseAction.VIEW_ARTICLE, {
      idArticle: articleId,
      via: "modal",
      // screen the modal was opened on
      page: store.getState().helpMode.page,
    });
  }, [dispatch, store, articleId]);

  // closing keeps the last article, so it does not blink out while the
  // modal fades away
  const shownId = articleId ?? data?.id ?? null;
  // the store may still hold the previous article while this one loads
  const article = data?.id === shownId ? data : null;
  const isLoading = !article && status !== "failed";

  const prepared = usePreparedArticle(article?.content);

  const close = () => dispatch(closeArticleModal());
  const openArticle = (id: number) => dispatch(openArticleModal(id));

  return (
    <DefaultModal
      open={articleId !== null}
      width={900}
      centered
      destroyOnHidden
      onCancel={close}
      footer={
        <>
          {shownId !== null && (
            <Button
              icon={<ExportOutlined />}
              href={articlePath(shownId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("knowledgeBase.openInNewTab")}
            </Button>
          )}
          <Button type="primary" onClick={close}>
            {t("knowledgeBase.close")}
          </Button>
        </>
      }
    >
      <ModalScroll ref={scrollRef}>
        {isLoading ? (
          <>
            <Skeleton active title={{ width: "60%" }} paragraph={{ rows: 2 }} />
            <Skeleton
              active
              paragraph={{ rows: 8 }}
              style={{ marginTop: 32 }}
            />
          </>
        ) : !article ? (
          <StateBox>
            <strong>{t("knowledgeBase.notFound")}</strong>
            <span>{t("knowledgeBase.notFoundHint")}</span>
          </StateBox>
        ) : (
          <>
            <ArticleContent
              className="article-content"
              article={article}
              html={prepared.html}
              onOpenArticle={openArticle}
            />
            {(article.related.length > 0 ||
              article.relatedLessons.length > 0) && (
              <ModalRelated>
                <ArticleRelated
                  article={article}
                  onOpenArticle={openArticle}
                  onOpenLesson={(lesson) => {
                    close();
                    navigate(
                      `/treinamento/${lesson.trainingId}/aula/${lesson.id}`,
                    );
                  }}
                />
              </ModalRelated>
            )}
          </>
        )}
      </ModalScroll>
    </DefaultModal>
  );
}
