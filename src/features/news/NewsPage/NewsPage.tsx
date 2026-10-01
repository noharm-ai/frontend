import { MouseEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, Skeleton } from "antd";
import {
  DownOutlined,
  ThunderboltOutlined,
  UpOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { useAppDispatch, useAppSelector } from "src/store";
import { Creators as UserCreators } from "store/ducks/user";
import { articlePath } from "features/knowledgeBase/articleContent";
import { usePreparedArticle } from "features/knowledgeBase/usePreparedArticle";
import { ArticleBody } from "features/knowledgeBase/KnowledgeBaseArticle/KnowledgeBaseArticle.style";

import { fetchNewsContent, fetchNewsList, INewsSummary } from "../NewsSlice";
import { isRecentNews } from "../newsDate";
import {
  DateBadge,
  Hero,
  MonthGroup,
  NewsCard,
  NewsItem,
  StateBox,
  Timeline,
} from "./NewsPage.style";

const groupByMonth = (news: INewsSummary[]) => {
  const groups: { month: string; items: INewsSummary[] }[] = [];

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

export function NewsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.news.list);
  const recentNews = useAppSelector(
    (state: any) => state.user.account.recentNews,
  );
  // the most recent news starts open
  const [openId, setOpenId] = useState<number | null | undefined>(undefined);

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

  const latest = list.data[0];
  const currentOpenId =
    openId === undefined ? (latest?.hasContent ? latest.id : null) : openId;

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
        <Timeline aria-busy="true">
          {[0, 1, 2].map((i) => (
            <NewsItem key={i}>
              <DateBadge />
              <NewsCard>
                <Skeleton
                  active
                  title={{ width: "50%" }}
                  paragraph={{ rows: 2 }}
                />
              </NewsCard>
            </NewsItem>
          ))}
        </Timeline>
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
        groups.map((group) => (
          <MonthGroup key={group.month}>
            <h2>{dayjs(`${group.month}-01`).format(t("news.monthFormat"))}</h2>
            <Timeline>
              {group.items.map((item) => (
                <NewsEntry
                  key={item.id}
                  news={item}
                  open={currentOpenId === item.id}
                  onToggle={() =>
                    setOpenId(currentOpenId === item.id ? null : item.id)
                  }
                />
              ))}
            </Timeline>
          </MonthGroup>
        ))
      )}
    </>
  );
}

function NewsEntry({
  news,
  open,
  onToggle,
}: {
  news: INewsSummary;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loaded = useAppSelector((state) => state.news.contents[news.id]);
  const prepared = usePreparedArticle(loaded?.content);
  const date = dayjs(news.date);
  const isNew = isRecentNews(news.date);
  const contentId = `news-content-${news.id}`;

  useEffect(() => {
    if (open && news.hasContent && !loaded) {
      dispatch(fetchNewsContent(news.id));
    }
  }, [dispatch, open, news.hasContent, news.id, loaded]);

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

      <NewsCard $open={open} $highlight={isNew} data-testid="news-card">
        <div className="news-header">
          <time dateTime={news.date}>{date.format(t("news.dateFormat"))}</time>
          {isNew && <span className="news-new">{t("news.new")}</span>}
        </div>
        <h3>{news.title}</h3>
        {news.description && <p className="news-lead">{news.description}</p>}

        {news.hasContent && (
          <>
            {open && (
              <div id={contentId} className="news-content">
                {!loaded || loaded.status === "loading" ? (
                  <Skeleton active title={false} paragraph={{ rows: 4 }} />
                ) : loaded.status === "failed" ? (
                  <div className="news-error">
                    {t("news.contentError")}
                    <Button
                      type="link"
                      onClick={() => dispatch(fetchNewsContent(news.id))}
                    >
                      {t("news.retry")}
                    </Button>
                  </div>
                ) : (
                  <ArticleBody
                    onClick={onBodyClick}
                    dangerouslySetInnerHTML={{ __html: prepared.html }}
                  />
                )}
              </div>
            )}

            <button
              type="button"
              className="news-toggle"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={onToggle}
            >
              {open ? (
                <>
                  {t("news.collapse")} <UpOutlined />
                </>
              ) : (
                <>
                  {t("news.readMore")} <DownOutlined />
                </>
              )}
            </button>
          </>
        )}
      </NewsCard>
    </NewsItem>
  );
}
