import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Col, Row, Skeleton } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExportOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";

import {
  fetchKnowledgeBaseArticle,
  fetchKnowledgeBaseArticles,
} from "../KnowledgeBaseSlice";
import {
  articlePath,
  buildLinkIndex,
  IArticleHeading,
  prepareArticleContent,
} from "../articleContent";
import {
  ArticleBody,
  ArticleHeader,
  ArticleShell,
  BackLink,
  ImagePreview,
  LinkList,
  SidePanel,
  Sidebar,
  StateBox,
  TocList,
} from "./KnowledgeBaseArticle.style";

const WORDS_PER_MINUTE = 200;
// the table of contents only helps once there is something to navigate
const MIN_TOC_HEADINGS = 2;
// a section becomes current once its heading reaches the top quarter
const TOC_ACTIVE_OFFSET = 0.25;

const readingMinutes = (html: string) => {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

export function KnowledgeBaseArticle() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const idArticle = Number(params.id);

  const list = useAppSelector((state) => state.knowledgeBase.list);
  const { status, data } = useAppSelector(
    (state) => state.knowledgeBase.article,
  );
  const bodyRef = useRef<HTMLDivElement>(null);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  useEffect(() => {
    // the list resolves links between articles
    if (list.status === "idle") {
      dispatch(fetchKnowledgeBaseArticles());
    }
  }, [dispatch, list.status]);

  useEffect(() => {
    if (!Number.isInteger(idArticle)) return;

    window.scrollTo({ top: 0 });
    dispatch(fetchKnowledgeBaseArticle(idArticle));
  }, [dispatch, idArticle]);

  // the store may still hold the previous article while this one loads
  const article = data?.id === idArticle ? data : null;
  const isLoading = !article && status !== "failed";

  const linkIndex = useMemo(() => buildLinkIndex(list.data), [list.data]);

  const content = article?.content ?? null;
  const prepared = useMemo(
    () =>
      content
        ? prepareArticleContent(content, linkIndex)
        : { html: "", headings: [] as IArticleHeading[] },
    [content, linkIndex],
  );

  // highlight the section being read: the last heading scrolled past the top
  // band of the viewport (a scroll listener, since fast scrolls skip headings
  // an IntersectionObserver would never report)
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || prepared.headings.length < MIN_TOC_HEADINGS) return;

    const headings = Array.from(body.querySelectorAll<HTMLElement>("h2[id]"));
    let frame = 0;

    const update = () => {
      frame = 0;
      const threshold = window.innerHeight * TOC_ACTIVE_OFFSET;
      const passed = headings.filter(
        (h) => h.getBoundingClientRect().top <= threshold,
      );

      setActiveHeading(passed.length ? passed[passed.length - 1].id : null);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [prepared]);

  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(`/base-de-conhecimento${from && from !== "?" ? from : ""}`);
  };

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
      navigate(articlePath(Number(anchor.getAttribute("data-kb-article"))));
    }
  };

  const scrollToHeading = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveHeading(id);
  };

  const back = (
    <BackLink type="button" onClick={goBack}>
      <ArrowLeftOutlined /> {t("knowledgeBase.backToList")}
    </BackLink>
  );

  if (isLoading) {
    return (
      <>
        {back}
        <ArticleShell>
          <Skeleton active title={{ width: "60%" }} paragraph={{ rows: 2 }} />
          <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 32 }} />
        </ArticleShell>
      </>
    );
  }

  if (!article) {
    return (
      <>
        {back}
        <StateBox>
          <strong>{t("knowledgeBase.notFound")}</strong>
          <span>{t("knowledgeBase.notFoundHint")}</span>
          <Button type="primary" onClick={goBack}>
            {t("knowledgeBase.backToList")}
          </Button>
        </StateBox>
      </>
    );
  }

  const showToc = prepared.headings.length >= MIN_TOC_HEADINGS;
  // until the reader scrolls, the first section is the current one
  const currentHeading = prepared.headings.some((h) => h.id === activeHeading)
    ? activeHeading
    : prepared.headings[0]?.id;
  const hasSidebar =
    showToc || article.related.length > 0 || article.relatedLessons.length > 0;

  return (
    <>
      {back}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={hasSidebar ? 17 : 24}>
          <ArticleShell>
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

            {prepared.html ? (
              <ArticleBody
                ref={bodyRef}
                onClick={onBodyClick}
                dangerouslySetInnerHTML={{ __html: prepared.html }}
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
          </ArticleShell>
        </Col>

        {hasSidebar && (
          <Col xs={24} lg={7}>
            <Sidebar>
              {showToc && (
                <SidePanel aria-label={t("knowledgeBase.onThisPage")}>
                  <h3>
                    <UnorderedListOutlined /> {t("knowledgeBase.onThisPage")}
                  </h3>
                  <TocList>
                    {prepared.headings.map((heading) => (
                      <li key={heading.id}>
                        <button
                          type="button"
                          aria-current={currentHeading === heading.id}
                          onClick={() => scrollToHeading(heading.id)}
                        >
                          {heading.text}
                        </button>
                      </li>
                    ))}
                  </TocList>
                </SidePanel>
              )}

              {article.relatedLessons.length > 0 && (
                <SidePanel>
                  <h3>
                    <PlayCircleOutlined /> {t("knowledgeBase.relatedLessons")}
                  </h3>
                  <LinkList>
                    {article.relatedLessons.map((lesson) => (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/treinamento/${lesson.trainingId}/aula/${lesson.id}`,
                            )
                          }
                        >
                          <span className="link-icon lesson">
                            <PlayCircleOutlined />
                          </span>
                          <span className="link-text">
                            <strong>{lesson.title}</strong>
                            <span>{lesson.trainingTitle}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </LinkList>
                </SidePanel>
              )}

              {article.related.length > 0 && (
                <SidePanel>
                  <h3>
                    <FileTextOutlined /> {t("knowledgeBase.relatedArticles")}
                  </h3>
                  <LinkList>
                    {article.related.map((related) => (
                      <li key={related.id}>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(articlePath(related.id), {
                              state: location.state,
                            })
                          }
                        >
                          <span className="link-icon">
                            <FileTextOutlined />
                          </span>
                          <span className="link-text">
                            <strong>{related.title}</strong>
                            {related.description && (
                              <span>{related.description}</span>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </LinkList>
                </SidePanel>
              )}
            </Sidebar>
          </Col>
        )}
      </Row>

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
    </>
  );
}
