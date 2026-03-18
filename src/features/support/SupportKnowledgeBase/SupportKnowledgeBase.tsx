import { useState } from "react";
import { Button, Input, Skeleton, Typography, Space } from "antd";
import { BookOutlined, LinkOutlined } from "@ant-design/icons";

import { useAppSelector } from "src/store";
import { trackSupportAction, TrackedSupportAction } from "utils/tracker";

const { Text, Paragraph } = Typography;

export function SupportKnowledgeBase() {
  const { status, list } = useAppSelector(
    (state) => state.support.knowledgeBase,
  );
  const [query, setQuery] = useState("");

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
                    {article.link && (
                      <div style={{ marginLeft: 24 }}>
                        <Button
                          type="link"
                          icon={<LinkOutlined />}
                          onClick={() => {
                            trackSupportAction(
                              TrackedSupportAction.OPEN_ARTICLE,
                            );
                            window.open(article.link, "_blank");
                          }}
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
    </div>
  );
}
