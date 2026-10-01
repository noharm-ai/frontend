import { ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Button, Col, Input, Row, Skeleton } from "antd";
import {
  ArrowRightOutlined,
  BulbOutlined,
  CustomerServiceOutlined,
  EnterOutlined,
  ExportOutlined,
  FileTextOutlined,
  RobotOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import { setSupportOpen } from "features/support/SupportSlice";
import { SupportAIModal } from "features/support/SupportAIModal/SupportAIModal";
import { trackSupportAction, TrackedSupportAction } from "utils/tracker";

import {
  fetchKnowledgeBaseArticles,
  IKnowledgeBaseArticleSummary,
  IKnowledgeBaseSearchResult,
  searchKnowledgeBase,
} from "../KnowledgeBaseSlice";
import { articlePath, normalizeText } from "../articleContent";
import {
  ArticleCard,
  Categories,
  CategoryChip,
  ExternalArticleCard,
  HelpBanner,
  Hero,
  RelevanceBadge,
  ResultList,
  SearchBox,
  SearchHint,
  SectionHeader,
  StateBox,
  Suggestions,
} from "./KnowledgeBaseHome.style";

// every search costs an embedding call: it only runs on enter or on the button
const SEARCH_MIN_LENGTH = 3;
const MAX_CARD_TAGS = 2;
// the rest of the categories sit behind a "more" toggle
const VISIBLE_CATEGORIES = 8;

const SUGGESTION_KEYS = ["suggestion1", "suggestion2", "suggestion3"];

const queryTerms = (query: string) =>
  normalizeText(query)
    .split(/\s+/)
    .filter((term) => term.length >= SEARCH_MIN_LENGTH);

/** Wrap the query terms found in the text in <mark>, ignoring accents. */
const highlight = (text: string, terms: string[]): ReactNode => {
  // per character, so indexes line up with the original text
  const normalized = [...text].map((ch) => normalizeText(ch) || ch).join("");
  if (!terms.length || normalized.length !== text.length) return text;

  const pattern = new RegExp(
    terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
    "g",
  );

  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of normalized.matchAll(pattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (start > last) parts.push(text.slice(last, start));
    parts.push(<mark key={start}>{text.slice(start, end)}</mark>);
    last = end;
  }
  if (last < text.length) parts.push(text.slice(last));

  return parts;
};

export function KnowledgeBaseHome() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const list = useAppSelector((state) => state.knowledgeBase.list);
  const search = useAppSelector((state) => state.knowledgeBase.search);

  // the committed query and category live in the URL, so coming back from an
  // article restores the same results
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("categoria");
  const [input, setInput] = useState(query);

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (list.status === "idle") {
      dispatch(fetchKnowledgeBaseArticles());
    }
  }, [dispatch, list.status]);

  const isSearching = query.length >= SEARCH_MIN_LENGTH;

  useEffect(() => {
    if (!isSearching) return;
    // results for this query are already in the store (e.g. coming back)
    if (search.query === query && search.status !== "failed") return;

    dispatch(searchKnowledgeBase(query));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, query, isSearching]);

  const submit = (value: string) => {
    setInput(value);
    updateParams({ q: value.trim() || null });
  };

  const changeInput = (value: string) => {
    setInput(value);
    // clearing the box goes straight back to the article list
    if (!value.trim() && query) updateParams({ q: null });
  };

  const pendingInput = input.trim();
  const isTooShort =
    pendingInput !== "" && pendingInput.length < SEARCH_MIN_LENGTH;
  // typed text that has not been searched yet
  const hasPendingSearch =
    !isTooShort && pendingInput !== "" && pendingInput !== query;

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    list.data.forEach((article) =>
      article.path.forEach((p) => counts.set(p, (counts.get(p) ?? 0) + 1)),
    );

    // most populated first
    return [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [list.data]);

  const [showAllCategories, setShowAllCategories] = useState(false);
  const hiddenCategories = Math.max(0, categories.length - VISIBLE_CATEGORIES);
  // the selected category never hides behind the toggle
  const visibleCategories =
    showAllCategories || !hiddenCategories
      ? categories
      : categories.filter(
          ([name], index) => index < VISIBLE_CATEGORIES || name === category,
        );

  const browseArticles = useMemo(
    () =>
      category
        ? list.data.filter((article) => article.path.includes(category))
        : list.data,
    [list.data, category],
  );

  // shown while the semantic search runs, and as a fallback if it fails
  const instantMatches = useMemo(() => {
    const terms = queryTerms(query);
    if (!terms.length) return [];

    return list.data.filter((article) => {
      const haystack = normalizeText(
        `${article.title} ${article.description ?? ""} ${article.path.join(" ")}`,
      );
      return terms.every((term) => haystack.includes(term));
    });
  }, [list.data, query]);

  return (
    <>
      <Hero>
        <div className="hero-inner">
          <span className="hero-eyebrow">
            <BulbOutlined /> {t("knowledgeBase.eyebrow")}
          </span>
          <h1 data-kb="knowledgeBase.title">{t("knowledgeBase.title")}</h1>
          <p className="hero-subtitle">{t("knowledgeBase.subtitle")}</p>

          <SearchBox>
            <Input
              autoFocus
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              placeholder={t("knowledgeBase.searchPlaceholder")}
              aria-label={t("knowledgeBase.searchPlaceholder")}
              value={input}
              onChange={(e) => changeInput(e.target.value)}
              onPressEnter={() => submit(input)}
              maxLength={500}
              suffix={
                <Button
                  type="primary"
                  className="search-button"
                  icon={<SearchOutlined />}
                  disabled={!hasPendingSearch}
                  onClick={() => submit(input)}
                >
                  {t("knowledgeBase.searchAction")}
                </Button>
              }
            />
          </SearchBox>

          <SearchHint
            aria-live="polite"
            $pending={isTooShort || hasPendingSearch}
          >
            {isTooShort ? (
              t("knowledgeBase.searchMinLength", { count: SEARCH_MIN_LENGTH })
            ) : hasPendingSearch ? (
              <>
                <EnterOutlined /> {t("knowledgeBase.searchPendingHint")}
              </>
            ) : (
              t("knowledgeBase.searchHint")
            )}
          </SearchHint>

          <Suggestions>
            <span>{t("knowledgeBase.suggestionsLabel")}</span>
            {SUGGESTION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => submit(t(`knowledgeBase.${key}`))}
              >
                {t(`knowledgeBase.${key}`)}
              </button>
            ))}
          </Suggestions>
        </div>
      </Hero>

      {isSearching ? (
        <SearchResults
          query={query}
          status={search.query === query ? search.status : "loading"}
          results={search.results}
          instantMatches={instantMatches}
        />
      ) : (
        <>
          <SectionHeader>
            <h2>{t("knowledgeBase.browseTitle")}</h2>
            {list.status === "succeeded" && (
              <span className="section-count">
                {t("knowledgeBase.articlesCount", {
                  count: browseArticles.length,
                })}
              </span>
            )}
          </SectionHeader>

          {categories.length > 0 && (
            <Categories role="group" aria-label={t("knowledgeBase.categories")}>
              <CategoryChip
                type="button"
                $active={!category}
                aria-pressed={!category}
                onClick={() => updateParams({ categoria: null })}
              >
                {t("knowledgeBase.allCategories")}
                <span className="chip-count">{list.data.length}</span>
              </CategoryChip>
              {visibleCategories.map(([name, count]) => (
                <CategoryChip
                  key={name}
                  type="button"
                  $active={category === name}
                  aria-pressed={category === name}
                  onClick={() =>
                    updateParams({
                      categoria: category === name ? null : name,
                    })
                  }
                >
                  {name}
                  <span className="chip-count">{count}</span>
                </CategoryChip>
              ))}
              {hiddenCategories > 0 && (
                <Button
                  type="link"
                  size="small"
                  aria-expanded={showAllCategories}
                  onClick={() => setShowAllCategories((value) => !value)}
                >
                  {showAllCategories
                    ? t("knowledgeBase.lessCategories")
                    : t("knowledgeBase.moreCategories", {
                        count: hiddenCategories,
                      })}
                </Button>
              )}
            </Categories>
          )}

          {list.status === "loading" || list.status === "idle" ? (
            <CardGridSkeleton />
          ) : list.status === "failed" ? (
            <StateBox>
              <strong>{t("knowledgeBase.loadError")}</strong>
              <Button
                type="link"
                onClick={() => dispatch(fetchKnowledgeBaseArticles())}
              >
                {t("knowledgeBase.retry")}
              </Button>
            </StateBox>
          ) : browseArticles.length === 0 ? (
            <StateBox>
              <strong>{t("knowledgeBase.empty")}</strong>
            </StateBox>
          ) : (
            <Row gutter={[16, 16]}>
              {browseArticles.map((article) => (
                <Col key={article.id} xs={24} md={12} xl={8}>
                  <ArticleSummaryCard article={article} />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      <HelpBanner>
        <span className="help-icon">
          <CustomerServiceOutlined />
        </span>
        <div className="help-text">
          <strong>{t("knowledgeBase.helpTitle")}</strong>
          <span>{t("knowledgeBase.helpText")}</span>
        </div>
        <div className="help-actions">
          <AIAgentLink />
          <HelpButton />
        </div>
      </HelpBanner>
    </>
  );
}

function HelpButton() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <Button onClick={() => dispatch(setSupportOpen(true))}>
      {t("knowledgeBase.helpAction")}
    </Button>
  );
}

function AIAgentLink() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="link"
        icon={<RobotOutlined />}
        onClick={() => {
          trackSupportAction(TrackedSupportAction.OPEN_AI_AGENT);
          setOpen(true);
        }}
      >
        {t("knowledgeBase.aiAgentAction")}
      </Button>
      <SupportAIModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function SearchResults({
  query,
  status,
  results,
  instantMatches,
}: {
  query: string;
  status: string;
  results: IKnowledgeBaseSearchResult[];
  instantMatches: IKnowledgeBaseArticleSummary[];
}) {
  const { t } = useTranslation();
  const terms = useMemo(() => queryTerms(query), [query]);

  if (status === "loading" || status === "idle") {
    return (
      <>
        <SectionHeader>
          <h2>{t("knowledgeBase.searching")}</h2>
        </SectionHeader>
        <ResultList>
          {instantMatches.slice(0, 3).map((article) => (
            <ArticleSummaryCard key={article.id} article={article} />
          ))}
          <Skeleton active paragraph={{ rows: 2 }} />
          <Skeleton active paragraph={{ rows: 2 }} />
        </ResultList>
      </>
    );
  }

  // the semantic search failed: fall back to matching titles
  const fallback = status === "failed";
  const items = fallback ? instantMatches : results;

  return (
    <>
      <SectionHeader>
        <h2>{t("knowledgeBase.resultsFor", { query })}</h2>
        <span className="section-count">
          {t("knowledgeBase.articlesCount", { count: items.length })}
        </span>
      </SectionHeader>

      {fallback && (
        <StateBox style={{ padding: "14px 20px", marginBottom: 12 }}>
          <span>{t("knowledgeBase.searchError")}</span>
        </StateBox>
      )}

      {items.length === 0 ? (
        <StateBox>
          <strong>{t("knowledgeBase.noResults", { query })}</strong>
          <span>{t("knowledgeBase.noResultsHint")}</span>
        </StateBox>
      ) : (
        <ResultList>
          {items.map((item) => (
            <ArticleSummaryCard
              key={item.id}
              article={item}
              snippet={
                "snippet" in item
                  ? highlight(
                      (item as IKnowledgeBaseSearchResult).snippet,
                      terms,
                    )
                  : undefined
              }
              score={
                "score" in item
                  ? (item as IKnowledgeBaseSearchResult).score
                  : undefined
              }
            />
          ))}
        </ResultList>
      )}
    </>
  );
}

function ArticleSummaryCard({
  article,
  snippet,
  score,
}: {
  article: IKnowledgeBaseArticleSummary;
  snippet?: ReactNode;
  score?: number;
}) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const external = !article.hasContent && Boolean(article.link);

  const relevance =
    score === undefined ? null : score >= 0.55 ? "high" : "medium";

  if (external) {
    return (
      <ExternalArticleCard
        href={article.link!}
        target="_blank"
        rel="noopener noreferrer"
      >
        <CardBody
          article={article}
          snippet={snippet}
          relevance={relevance}
          footerExtra={
            <span className="card-external">
              <ExportOutlined /> {t("knowledgeBase.externalArticle")}
            </span>
          }
        />
      </ExternalArticleCard>
    );
  }

  return (
    <ArticleCard
      to={articlePath(article.id)}
      // lets the article page link back to these same results
      state={{ from: `?${searchParams.toString()}` }}
    >
      <CardBody article={article} snippet={snippet} relevance={relevance} />
    </ArticleCard>
  );
}

function CardBody({
  article,
  snippet,
  relevance,
  footerExtra,
}: {
  article: IKnowledgeBaseArticleSummary;
  snippet?: ReactNode;
  relevance: "high" | "medium" | null;
  footerExtra?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className="card-top">
        <span className="card-icon">
          <FileTextOutlined />
        </span>
        <span className="card-title">{article.title}</span>
        {relevance ? (
          <RelevanceBadge $level={relevance}>
            {t(`knowledgeBase.relevance.${relevance}`)}
          </RelevanceBadge>
        ) : (
          <ArrowRightOutlined className="card-arrow" />
        )}
      </div>

      {snippet ? (
        <p className="card-snippet">{snippet}</p>
      ) : (
        article.description && (
          <p className="card-description">{article.description}</p>
        )
      )}

      <div className="card-footer">
        {article.path.slice(0, MAX_CARD_TAGS).map((p) => (
          <span key={p} className="card-tag">
            {p}
          </span>
        ))}
        {article.path.length > MAX_CARD_TAGS && (
          <span className="card-tag">
            +{article.path.length - MAX_CARD_TAGS}
          </span>
        )}
        {footerExtra}
      </div>
    </>
  );
}

function CardGridSkeleton() {
  return (
    <Row gutter={[16, 16]}>
      {[1, 2, 3, 4, 5, 6].map((key) => (
        <Col key={key} xs={24} md={12} xl={8}>
          <StateBox style={{ padding: 20, textAlign: "left" }}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </StateBox>
        </Col>
      ))}
    </Row>
  );
}
