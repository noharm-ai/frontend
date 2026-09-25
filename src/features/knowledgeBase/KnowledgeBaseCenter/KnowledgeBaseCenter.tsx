import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Empty, Input, Skeleton, Spin } from "antd";
import {
  BookOutlined,
  EditOutlined,
  ExportOutlined,
  LinkOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import api from "services/api";
import Button from "components/Button";
import { KnowledgeBasePathEnum } from "models/KnowledgeBasePathEnum";
import { formatDateTime } from "utils/date";
import { trackSupportAction, TrackedSupportAction } from "utils/tracker";
import { PageHeader } from "styles/PageHeader.style";
import { PageContainer } from "styles/Utils.style";

import { IKnowledgeBaseArticle } from "../KnowledgeBaseSlice";
import { KnowledgeBaseArticleView } from "../KnowledgeBaseArticleView/KnowledgeBaseArticleView";
import { KnowledgeBaseForm } from "../KnowledgeBaseForm/KnowledgeBaseForm";
import { canWriteKnowledgeBase } from "../knowledgeBasePermissions";
import {
  ArticleCard,
  ArticleGrid,
  ArticlePage,
  CenterLayout,
  TopicList,
  TopicSection,
} from "./KnowledgeBaseCenter.style";

// articles pinned to no page are gathered here
const NO_TOPIC = "__sem_tema__";
const RECENT_COUNT = 6;
const SEARCH_DELAY_MS = 400;

const topicLabel = (value: string) => {
  if (value === KnowledgeBasePathEnum.GENERAL) return "Geral";
  if (value === NO_TOPIC) return "Outros";

  return (
    KnowledgeBasePathEnum.getOptions().find((option) => option.value === value)
      ?.label ?? value
  );
};

const topicsOf = (article: IKnowledgeBaseArticle) =>
  article.path.length ? article.path : [NO_TOPIC];

// topics in the order of the page list, then any other one found in the data
const topicOrder = (topics: string[]) => {
  const known = KnowledgeBasePathEnum.getOptions().map((o) => o.value);
  const rank = (topic: string) => {
    const index = known.indexOf(topic);
    if (topic === NO_TOPIC) return known.length + 1;
    return index === -1 ? known.length : index;
  };

  return [...topics].sort(
    (a, b) => rank(a) - rank(b) || topicLabel(a).localeCompare(topicLabel(b)),
  );
};

const lastUpdate = (article: IKnowledgeBaseArticle) =>
  article.updatedAt ?? article.createdAt ?? "";

function Card({
  article,
  onOpen,
}: {
  article: IKnowledgeBaseArticle;
  onOpen: (article: IKnowledgeBaseArticle) => void;
}) {
  return (
    <ArticleCard
      type="button"
      onClick={() => onOpen(article)}
      aria-label={article.title}
    >
      <div className="title">
        {article.hasContent ? <BookOutlined /> : <LinkOutlined />}
        <span>{article.title}</span>
        {!article.hasContent && <ExportOutlined className="external" />}
      </div>
      {article.description && (
        <div className="description">{article.description}</div>
      )}
    </ArticleCard>
  );
}

export function KnowledgeBaseCenter() {
  const navigate = useNavigate();
  const params = useParams();
  const articleId = params.id ? Number(params.id) : null;
  const canWrite = canWriteKnowledgeBase();

  const [articles, setArticles] = useState<IKnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  // the last search answered, with the term it answers
  const [results, setResults] = useState<{
    term: string;
    list: IKnowledgeBaseArticle[];
  } | null>(null);
  const [topic, setTopic] = useState<string | null>(null);

  // the last article loaded; failed when it does not exist or is hidden
  const [loaded, setLoaded] = useState<{
    id: number;
    article: IKnowledgeBaseArticle | null;
  } | null>(null);
  const [editing, setEditing] = useState(false);

  const trimmedTerm = term.trim();
  const searching = !!trimmedTerm && results?.term !== trimmedTerm;
  const article = loaded?.id === articleId ? loaded.article : null;
  const articleFailed = loaded?.id === articleId && loaded.article === null;

  const loadArticles = () =>
    api.knowledgeBase
      .browse()
      .then((response: any) => setArticles(response.data.data))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadArticles();
  }, []);

  // the search runs on the server: the same full text search the n0 agent
  // uses, so accents and word forms do not matter
  useEffect(() => {
    if (!trimmedTerm) return undefined;

    let active = true;
    const timer = setTimeout(() => {
      api.knowledgeBase
        .browse({ term: trimmedTerm })
        .then((response: any) => response.data.data)
        .catch(() => [])
        .then((list: IKnowledgeBaseArticle[]) => {
          if (active) setResults({ term: trimmedTerm, list });
        });
    }, SEARCH_DELAY_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [trimmedTerm]);

  useEffect(() => {
    if (!articleId) return undefined;

    let active = true;
    api.knowledgeBase
      .get(articleId)
      .then((response: any) => {
        if (!active) return;
        setLoaded({ id: articleId, article: response.data.data });
        trackSupportAction(TrackedSupportAction.OPEN_ARTICLE);
      })
      .catch(() => {
        if (active) setLoaded({ id: articleId, article: null });
      });

    return () => {
      active = false;
    };
  }, [articleId]);

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    articles.forEach((a) =>
      topicsOf(a).forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)),
    );

    return topicOrder([...counts.keys()]).map((value) => ({
      value,
      label: topicLabel(value),
      count: counts.get(value) ?? 0,
    }));
  }, [articles]);

  const openArticle = (target: IKnowledgeBaseArticle) => {
    if (target.hasContent) {
      navigate(`/base-conhecimento/${target.id}`);
      window.scrollTo(0, 0);
    } else if (target.link) {
      trackSupportAction(TrackedSupportAction.OPEN_ARTICLE);
      window.open(target.link, "_blank", "noopener");
    }
  };

  const selectTopic = (value: string | null) => {
    setTopic(value);
    setTerm("");
    if (articleId) navigate("/base-conhecimento");
  };

  const byTopic = (value: string) =>
    articles.filter((a) => topicsOf(a).includes(value));

  const renderCards = (list: IKnowledgeBaseArticle[]) => (
    <ArticleGrid>
      {list.map((a) => (
        <Card key={a.id} article={a} onOpen={openArticle} />
      ))}
    </ArticleGrid>
  );

  const renderHome = () => {
    if (loading) {
      return <Skeleton active paragraph={{ rows: 6 }} />;
    }

    if (!articles.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Nenhum artigo publicado ainda."
        />
      );
    }

    if (topic) {
      return (
        <TopicSection>
          <h2>{topicLabel(topic)}</h2>
          {renderCards(byTopic(topic))}
        </TopicSection>
      );
    }

    const recent = [...articles]
      .sort((a, b) => lastUpdate(b).localeCompare(lastUpdate(a)))
      .slice(0, RECENT_COUNT);

    return (
      <>
        <TopicSection>
          <h2>Atualizados recentemente</h2>
          {renderCards(recent)}
        </TopicSection>
        {topics.map((item) => (
          <TopicSection key={item.value}>
            <h2>
              <Button type="link" onClick={() => selectTopic(item.value)}>
                {item.label}
              </Button>
            </h2>
            {renderCards(byTopic(item.value))}
          </TopicSection>
        ))}
      </>
    );
  };

  const renderSearch = () => {
    if (searching || !results) {
      return <Spin />;
    }
    const list = results.list;

    return (
      <TopicSection>
        <h2>
          {list.length
            ? `${list.length} ${
                list.length === 1 ? "artigo encontrado" : "artigos encontrados"
              } para “${trimmedTerm}”`
            : `Nenhum artigo encontrado para “${trimmedTerm}”`}
        </h2>
        {renderCards(list)}
      </TopicSection>
    );
  };

  const renderArticle = () => {
    if (articleFailed) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Artigo não encontrado."
        >
          <Button onClick={() => navigate("/base-conhecimento")}>
            Voltar para a base de conhecimento
          </Button>
        </Empty>
      );
    }

    if (!article) {
      return <Skeleton active paragraph={{ rows: 8 }} />;
    }

    const firstTopic = topicsOf(article)[0];
    // related: other articles sharing a page with this one
    const related = articles
      .filter(
        (a) =>
          a.id !== article.id &&
          a.path.some((path) => article.path.includes(path)),
      )
      .slice(0, 6);

    return (
      <ArticlePage>
        <Breadcrumb
          items={[
            {
              title: <Link to="/base-conhecimento">Base de conhecimento</Link>,
            },
            {
              title: (
                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    selectTopic(firstTopic);
                  }}
                >
                  {topicLabel(firstTopic)}
                </a>
              ),
            },
            { title: article.title },
          ]}
        />

        <header>
          <h1>{article.title}</h1>
          <div className="meta">
            Atualizado em {formatDateTime(lastUpdate(article))}
          </div>
          <div className="actions">
            {article.link && (
              <Button
                icon={<LinkOutlined />}
                onClick={() => window.open(article.link!, "_blank", "noopener")}
              >
                Abrir link externo
              </Button>
            )}
            {canWrite && (
              <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
                Editar
              </Button>
            )}
          </div>
        </header>

        <KnowledgeBaseArticleView article={article} />

        {related.length > 0 && (
          <TopicSection className="related">
            <h2>Artigos relacionados</h2>
            {renderCards(related)}
          </TopicSection>
        )}
      </ArticlePage>
    );
  };

  let main;
  if (articleId) {
    main = renderArticle();
  } else if (trimmedTerm) {
    main = renderSearch();
  } else {
    main = renderHome();
  }

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Base de conhecimento</h1>
          <div className="page-header-legend">
            Artigos de ajuda para aprender a usar a NoHarm.
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            icon={<ExportOutlined />}
            onClick={() =>
              window.open(
                `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/39`,
                "_blank",
                "noopener",
              )
            }
          >
            Base de conhecimento anterior
          </Button>
          {canWrite && (
            <Button
              icon={<SettingOutlined />}
              onClick={() => navigate("/admin/base-conhecimento")}
            >
              Gerenciar artigos
            </Button>
          )}
        </div>
      </PageHeader>

      <CenterLayout>
        <aside>
          <Input.Search
            placeholder="Buscar artigos"
            allowClear
            value={term}
            onChange={({ target }) => setTerm(target.value)}
            onSearch={(value) => setTerm(value)}
          />
          <TopicList aria-label="Temas">
            <li>
              <button
                type="button"
                className={!topic && !articleId && !term ? "active" : ""}
                onClick={() => selectTopic(null)}
              >
                <span>Todos os artigos</span>
                <span className="count">{articles.length}</span>
              </button>
            </li>
            {topics.map((item) => (
              <li key={item.value}>
                <button
                  type="button"
                  className={topic === item.value && !articleId ? "active" : ""}
                  onClick={() => selectTopic(item.value)}
                >
                  <span>{item.label}</span>
                  <span className="count">{item.count}</span>
                </button>
              </li>
            ))}
          </TopicList>
        </aside>
        <main>{main}</main>
      </CenterLayout>

      {canWrite && articleId && (
        <KnowledgeBaseForm
          open={editing}
          articleId={articleId}
          onClose={() => setEditing(false)}
          onSaved={(saved) => {
            setLoaded({ id: saved.id, article: saved });
            loadArticles();
          }}
        />
      )}
    </PageContainer>
  );
}
