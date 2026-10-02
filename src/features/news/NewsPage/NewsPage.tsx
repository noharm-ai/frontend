import { MouseEvent, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, Skeleton } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import { Creators as UserCreators } from "store/ducks/user";
import { articlePath } from "features/knowledgeBase/articleContent";
import { usePreparedArticle } from "features/knowledgeBase/usePreparedArticle";
import { ArticleBody } from "features/knowledgeBase/KnowledgeBaseArticle/KnowledgeBaseArticle.style";

import {
  fetchMoreNews,
  fetchNewsList,
  INews,
  NEWS_PAGE_SIZE,
} from "../NewsSlice";
import { isRecentNews } from "../newsDate";
import {
  DateBadge,
  Hero,
  LoadMore,
  MonthGroup,
  NewsCard,
  NewsItem,
  StateBox,
  Timeline,
} from "./NewsPage.style";

const groupByMonth = (news: INews[]) => {
  const groups: { month: string; items: INews[] }[] = [];

  news.forEach((item) => {
    const month = item.date.slice(0, 7);
    const last = groups[groups.length - 1];

    if (last?.month === month) {
      last.items.push(item);
    } else {
      groups.push({ month, items: [item] });
    }
  });

  return groups;
};

// the next page starts loading this far before the end of the list shows up
const LOAD_MORE_MARGIN = "0px 0px 600px 0px";

function NewsSkeleton({ count }: { count: number }) {
  return (
    <Timeline aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <NewsItem key={i}>
          <DateBadge />
          <NewsCard>
            <Skeleton active title={{ width: "50%" }} paragraph={{ rows: 5 }} />
          </NewsCard>
        </NewsItem>
      ))}
    </Timeline>
  );
}

export function NewsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.news.list);
  const recentNews = useAppSelector(
    (state: any) => state.user.account.recentNews,
  );

  useEffect(() => {
    dispatch(fetchNewsList());
  }, [dispatch]);

  // the news have been seen: the menu badge goes away until the next login
  useEffect(() => {
    if (recentNews) {
      dispatch(UserCreators.userSetAccountField({ recentNews: 0 }));
    }
  }, [dispatch, recentNews]);

  const groups = useMemo(() => groupByMonth(list.data), [list.data]);

  // infinite scroll: the next page loads as the end of the list nears. The
  // observer is recreated after every page, so a page too short to fill the
  // screen still triggers the next one. A failed page waits for a retry.
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const canLoadMore =
    list.status === "succeeded" &&
    list.hasMore &&
    list.moreStatus !== "loading" &&
    list.moreStatus !== "failed";

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!canLoadMore || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          dispatch(fetchMoreNews());
        }
      },
      { rootMargin: LOAD_MORE_MARGIN },
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, [dispatch, canLoadMore, list.data.length]);

  return (
    <>
      <Hero>
        <div className="hero-inner">
          <span className="hero-eyebrow">
            <ThunderboltOutlined /> {t("news.eyebrow")}
          </span>
          <h1 data-kb="news.title">{t("news.title")}</h1>
          <p className="hero-subtitle">{t("news.subtitle")}</p>
        </div>
      </Hero>

      {list.status === "loading" || list.status === "idle" ? (
        <NewsSkeleton count={3} />
      ) : list.status === "failed" ? (
        <StateBox>
          <strong>{t("news.loadError")}</strong>
          <Button type="link" onClick={() => dispatch(fetchNewsList())}>
            {t("news.retry")}
          </Button>
        </StateBox>
      ) : list.data.length === 0 ? (
        <StateBox>
          <strong>{t("news.empty")}</strong>
          <span>{t("news.emptyHint")}</span>
        </StateBox>
      ) : (
        <>
          {groups.map((group) => (
            <MonthGroup key={group.month}>
              <h2>
                {dayjs(`${group.month}-01`).format(t("news.monthFormat"))}
              </h2>
              <Timeline>
                {group.items.map((item) => (
                  <NewsEntry key={item.id} news={item} />
                ))}
              </Timeline>
            </MonthGroup>
          ))}

          {list.hasMore ? (
            <LoadMore ref={loadMoreRef} data-testid="news-load-more">
              {list.moreStatus === "loading" ? (
                <NewsSkeleton count={1} />
              ) : list.moreStatus === "failed" ? (
                <>
                  {t("news.loadMoreError")}
                  <Button type="link" onClick={() => dispatch(fetchMoreNews())}>
                    {t("news.retry")}
                  </Button>
                </>
              ) : (
                <Button onClick={() => dispatch(fetchMoreNews())}>
                  {t("news.loadMore")}
                </Button>
              )}
            </LoadMore>
          ) : (
            list.data.length > NEWS_PAGE_SIZE && (
              <LoadMore>
                <div className="load-more-end">{t("news.end")}</div>
              </LoadMore>
            )
          )}
        </>
      )}
    </>
  );
}

function NewsEntry({ news }: { news: INews }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const prepared = usePreparedArticle(news.content);
  const date = dayjs(news.date);
  const isNew = isRecentNews(news.date);

  // links to knowledge base articles stay inside the app
  const onBodyClick = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest("a[data-kb-article]");
    if (anchor && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      navigate(articlePath(Number(anchor.getAttribute("data-kb-article"))));
    }
  };

  return (
    <NewsItem>
      <DateBadge $highlight={isNew} aria-hidden="true">
        <span className="day">{date.format("DD")}</span>
        <span className="month">{date.format("MMM")}</span>
      </DateBadge>

      <NewsCard $highlight={isNew} data-testid="news-card">
        <div className="news-header">
          <time dateTime={news.date}>{date.format(t("news.dateFormat"))}</time>
          {isNew && <span className="news-new">{t("news.new")}</span>}
        </div>
        <h3>{news.title}</h3>
        {news.description && <p className="news-lead">{news.description}</p>}

        {news.content && (
          <div className="news-content">
            <ArticleBody
              onClick={onBodyClick}
              dangerouslySetInnerHTML={{ __html: prepared.html }}
            />
          </div>
        )}
      </NewsCard>
    </NewsItem>
  );
}
