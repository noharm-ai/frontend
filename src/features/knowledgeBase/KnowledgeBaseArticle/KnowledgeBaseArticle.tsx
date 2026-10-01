import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Col, Row, Skeleton } from "antd";
import { ArrowLeftOutlined, UnorderedListOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";

import { fetchKnowledgeBaseArticle } from "../KnowledgeBaseSlice";
import { articlePath } from "../articleContent";
import { usePreparedArticle } from "../usePreparedArticle";
import { ArticleContent } from "../ArticleContent/ArticleContent";
import { ArticleRelated } from "../ArticleRelated/ArticleRelated";
import {
  ArticleShell,
  BackLink,
  SidePanel,
  Sidebar,
  StateBox,
  TocList,
} from "./KnowledgeBaseArticle.style";

// the table of contents only helps once there is something to navigate
const MIN_TOC_HEADINGS = 2;
// a section becomes current once its heading reaches the top quarter
const TOC_ACTIVE_OFFSET = 0.25;

export function KnowledgeBaseArticle() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const idArticle = Number(params.id);

  const { status, data } = useAppSelector(
    (state) => state.knowledgeBase.article,
  );
  const bodyRef = useRef<HTMLDivElement>(null);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(idArticle)) return;

    window.scrollTo({ top: 0 });
    dispatch(fetchKnowledgeBaseArticle(idArticle));
  }, [dispatch, idArticle]);

  // the store may still hold the previous article while this one loads
  const article = data?.id === idArticle ? data : null;
  const isLoading = !article && status !== "failed";

  const prepared = usePreparedArticle(article?.content);

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
          <ArticleContent
            article={article}
            html={prepared.html}
            bodyRef={bodyRef}
            onOpenArticle={(id) => navigate(articlePath(id))}
          />
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

              <ArticleRelated
                article={article}
                onOpenLesson={(lesson) =>
                  navigate(
                    `/treinamento/${lesson.trainingId}/aula/${lesson.id}`,
                  )
                }
                onOpenArticle={(id) =>
                  navigate(articlePath(id), { state: location.state })
                }
              />
            </Sidebar>
          </Col>
        )}
      </Row>
    </>
  );
}
