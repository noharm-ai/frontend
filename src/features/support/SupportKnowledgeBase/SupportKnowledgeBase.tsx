import { useState } from "react";
import { Button, Input, Skeleton, Typography, Space } from "antd";
import { BookOutlined, LinkOutlined, PlusOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import { trackSupportAction, TrackedSupportAction } from "utils/tracker";
import { fetchKnowledgeBaseArticles } from "features/support/SupportSlice";
import { KnowledgeBaseArticleModal } from "features/knowledgeBase/KnowledgeBaseArticleModal/KnowledgeBaseArticleModal";
import { KnowledgeBaseForm } from "features/knowledgeBase/KnowledgeBaseForm/KnowledgeBaseForm";
import { canWriteKnowledgeBase } from "features/knowledgeBase/knowledgeBasePermissions";

const { Text, Paragraph } = Typography;

interface SupportKnowledgeBaseProps {
  // the KnowledgeBasePathEnum value of the page the panel was opened on
  path: string;
}

export function SupportKnowledgeBase({ path }: SupportKnowledgeBaseProps) {
  const dispatch = useAppDispatch();
  const { status, list } = useAppSelector(
    (state) => state.support.knowledgeBase,
  );
  const [query, setQuery] = useState("");
  const [articleId, setArticleId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const canWrite = canWriteKnowledgeBase();

  const openArticle = (article: any) => {
    trackSupportAction(TrackedSupportAction.OPEN_ARTICLE);

    // written in NoHarm: read it here; otherwise it lives behind the link
    if (article.hasContent) {
      setArticleId(article.id);
    } else {
      window.open(article.link, "_blank", "noopener");
    }
  };

  const reload = () =>
    // @ts-expect-error ts 2554 (legacy code)
    dispatch(fetchKnowledgeBaseArticles({ active: true, path: [path] }));

  const isLoading = status === "loading" || status === "idle";

  const filtered =
    query.trim() === ""
      ? list
      : list.filter((article: any) => {
          const q = query.toLowerCase();
          return (
            article.title?.toLowerCase().includes(q) ||
            article.description?.toLowerCase().includes(q)
          );
        });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {!isLoading && list && list.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text type="secondary" style={{ fontSize: 13, flex: 1 }}>
            Encontramos alguns artigos que podem te ajudar:
          </Text>
          <Input.Search
            placeholder="Buscar..."
            allowClear
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      )}
      <div
        style={{
          maxHeight: "40vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {isLoading ? (
          <>
            <Skeleton active paragraph={{ rows: 3 }} />
            <Skeleton active paragraph={{ rows: 3 }} />
          </>
        ) : list && list.length > 0 ? (
          <>
            {filtered.length === 0 ? (
              <Text type="secondary">
                Nenhum artigo encontrado para &ldquo;{query}&rdquo;.
              </Text>
            ) : (
              <Space
                orientation="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                {filtered.map((article: any) => (
                  <div
                    key={article.id}
                    style={{
                      border: "1px solid #e8e8e8",
                      borderRadius: 8,
                      padding: "12px 16px",
                      background: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        marginBottom: article.description ? 6 : 0,
                      }}
                    >
                      <BookOutlined
                        style={{ color: "#FF8845", marginTop: 3 }}
                      />
                      <Text strong>{article.title}</Text>
                    </div>
                    {article.description && (
                      <Paragraph
                        type="secondary"
                        style={{ margin: "0 0 8px 24px", fontSize: 13 }}
                      >
                        {article.description}
                      </Paragraph>
                    )}
                    {(article.hasContent || article.link) && (
                      <div style={{ marginLeft: 24 }}>
                        <Button
                          type="link"
                          icon={
                            article.hasContent ? (
                              <BookOutlined />
                            ) : (
                              <LinkOutlined />
                            )
                          }
                          onClick={() => openArticle(article)}
                          style={{ padding: 0, height: "auto", fontSize: 13 }}
                        >
                          Ver artigo
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </Space>
            )}
          </>
        ) : (
          <Text type="secondary">
            Nenhum artigo encontrado para esta página.
          </Text>
        )}
      </div>
      {canWrite && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setCreating(true)}
        >
          Adicionar artigo nesta página
        </Button>
      )}

      <KnowledgeBaseArticleModal
        articleId={articleId}
        onClose={() => setArticleId(null)}
      />
      {canWrite && (
        <KnowledgeBaseForm
          open={creating}
          defaults={{ path: [path] }}
          onClose={() => setCreating(false)}
          onSaved={reload}
        />
      )}
    </div>
  );
}
