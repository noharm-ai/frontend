import { useEffect, useState } from "react";
import { Input, Select, Space, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import Button from "components/Button";
import { useAppDispatch, useAppSelector } from "src/store";
import { KnowledgeBasePathEnum } from "models/KnowledgeBasePathEnum";
import { KnowledgeBaseSectionEnum } from "models/KnowledgeBaseSectionEnum";
import { formatDateTime } from "utils/date";
import {
  PageCard,
  PageContainer,
  PaginationContainer,
} from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

import {
  IKnowledgeBaseArticle,
  IKnowledgeBaseFilters,
  fetchKnowledgeBaseArticles,
  setFilters,
} from "../KnowledgeBaseSlice";
import { KnowledgeBaseForm } from "../KnowledgeBaseForm/KnowledgeBaseForm";
import { KnowledgeBaseArticleModal } from "../KnowledgeBaseArticleModal/KnowledgeBaseArticleModal";
import { FilterBar } from "./KnowledgeBaseAdmin.style";

const pageLabel = (value: string) =>
  KnowledgeBasePathEnum.getOptions().find((option) => option.value === value)
    ?.label ?? value;

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum artigo encontrado."
  />
);

export function KnowledgeBaseAdmin() {
  const dispatch = useAppDispatch();
  const { list, status, filters } = useAppSelector(
    (state) => state.knowledgeBase,
  );
  const [draft, setDraft] = useState<IKnowledgeBaseFilters>(filters);
  // undefined: form closed; null: new article; a number: edit that article
  const [editing, setEditing] = useState<number | null | undefined>(undefined);
  const [viewing, setViewing] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchKnowledgeBaseArticles(filters));
  }, [dispatch, filters]);

  const search = () => dispatch(setFilters({ ...draft }));

  // components/Table is untyped (unknown rows)
  const columns: ColumnsType<any> = [
    {
      title: "Título",
      dataIndex: "title",
      render: (_: string, record: IKnowledgeBaseArticle) => (
        <>
          <div>{record.title}</div>
          {record.description && (
            <div style={{ color: "#8c8c8c", fontSize: 12 }}>
              {record.description}
            </div>
          )}
        </>
      ),
    },
    {
      title: "Onde aparece",
      render: (_: unknown, record: IKnowledgeBaseArticle) => (
        <Space size={[0, 4]} wrap>
          {record.path.map((path) => (
            <Tag key={`p-${path}`}>{pageLabel(path)}</Tag>
          ))}
          {record.section.map((section) => (
            <Tag key={`s-${section}`} color="blue">
              {KnowledgeBaseSectionEnum.getLabel(section)}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Origem",
      width: 130,
      render: (_: unknown, record: IKnowledgeBaseArticle) => (
        <Space size={[0, 4]} wrap>
          {record.hasContent && <Tag color="green">NoHarm</Tag>}
          {record.link && (
            <Tooltip title={record.link}>
              <Tag>Link</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Situação",
      width: 120,
      render: (_: unknown, record: IKnowledgeBaseArticle) =>
        record.active ? (
          <Tag color="green">Publicado</Tag>
        ) : (
          <Tag color="orange">Rascunho</Tag>
        ),
    },
    {
      title: "Atualizado em",
      width: 150,
      render: (_: unknown, record: IKnowledgeBaseArticle) =>
        formatDateTime(record.updatedAt ?? record.createdAt),
    },
    {
      title: "Ações",
      width: 100,
      align: "center" as const,
      render: (_: unknown, record: IKnowledgeBaseArticle) => (
        <Space>
          <Tooltip title="Visualizar">
            <Button
              icon={<EyeOutlined />}
              disabled={!record.hasContent && !record.link}
              onClick={() =>
                record.hasContent
                  ? setViewing(record.id)
                  : window.open(record.link!, "_blank", "noopener")
              }
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditing(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Base de conhecimento</h1>
          <div className="page-header-legend">
            Artigos de ajuda exibidos no painel de suporte, nas seções das
            páginas e consultados pelo assistente N0.
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setEditing(null)}
          >
            Novo artigo
          </Button>
        </div>
      </PageHeader>

      <FilterBar>
        <Input
          placeholder="Buscar pelo título ou resumo"
          allowClear
          value={draft.term ?? ""}
          onChange={({ target }) => setDraft({ ...draft, term: target.value })}
          onPressEnter={search}
        />
        <Select
          mode="multiple"
          placeholder="Páginas"
          allowClear
          value={draft.path ?? []}
          options={KnowledgeBasePathEnum.getOptions()}
          optionFilterProp="label"
          onChange={(path) => setDraft({ ...draft, path })}
        />
        <Select
          mode="multiple"
          placeholder="Seções"
          allowClear
          value={draft.section ?? []}
          options={KnowledgeBaseSectionEnum.getOptions()}
          optionFilterProp="label"
          onChange={(section) => setDraft({ ...draft, section })}
        />
        <Select
          placeholder="Situação"
          allowClear
          value={draft.active ?? undefined}
          options={[
            { value: true, label: "Publicado" },
            { value: false, label: "Rascunho" },
          ]}
          onChange={(active) => setDraft({ ...draft, active: active ?? null })}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={search}>
          Pesquisar
        </Button>
      </FilterBar>

      <PaginationContainer>
        {list.length} registros encontrados
      </PaginationContainer>
      <PageCard>
        <Table
          rowKey="id"
          columns={columns}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status === "succeeded" ? list : []}
        />
      </PageCard>

      <KnowledgeBaseForm
        open={editing !== undefined}
        articleId={editing}
        onClose={() => setEditing(undefined)}
      />
      <KnowledgeBaseArticleModal
        articleId={viewing}
        onClose={() => setViewing(null)}
      />
      <BackTop />
    </PageContainer>
  );
}
