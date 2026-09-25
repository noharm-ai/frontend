import { useEffect, useState } from "react";
import { Input, Select, Space, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CloudSyncOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import Button from "components/Button";
import notification from "components/notification";
import api from "services/api";
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
  VectorIndexStatus,
  fetchKnowledgeBaseArticles,
  setFilters,
} from "../KnowledgeBaseSlice";
import { KnowledgeBaseForm } from "../KnowledgeBaseForm/KnowledgeBaseForm";
import { KnowledgeBaseArticleModal } from "../KnowledgeBaseArticleModal/KnowledgeBaseArticleModal";
import { FilterBar } from "./KnowledgeBaseAdmin.style";

const pageLabel = (value: string) =>
  KnowledgeBasePathEnum.getOptions().find((option) => option.value === value)
    ?.label ?? value;

const indexMessages: Record<VectorIndexStatus, string> = {
  indexed: "Artigo indexado para o assistente N0.",
  removed: "Artigo não publicado: removido do índice do assistente N0.",
  disabled: "O índice vetorial do assistente N0 não está configurado.",
  failed: "Não foi possível indexar o artigo. Tente novamente mais tarde.",
};

const reindex = async (id: number): Promise<VectorIndexStatus> => {
  try {
    const response: any = await api.knowledgeBase.reindex(id);
    return response.data.data.vectorIndex;
  } catch {
    return "failed";
  }
};

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
  const [indexing, setIndexing] = useState<number | null>(null);
  // progress of "index all": how many articles are done
  const [bulkProgress, setBulkProgress] = useState<number | null>(null);

  const indexOne = async (id: number) => {
    setIndexing(id);
    const result = await reindex(id);
    setIndexing(null);

    const message = indexMessages[result];
    if (result === "failed") {
      notification.error({ message });
    } else if (result === "disabled") {
      notification.warning({ message });
    } else {
      notification.success({ message });
    }
  };

  // writes every listed article to the index, one at a time: how existing
  // articles get there, and how failed saves are caught up
  const indexAll = async () => {
    const counts: Record<VectorIndexStatus, number> = {
      indexed: 0,
      removed: 0,
      disabled: 0,
      failed: 0,
    };

    for (let n = 0; n < list.length; n += 1) {
      setBulkProgress(n);
      const result = await reindex(list[n].id);
      counts[result] += 1;

      if (result === "disabled") {
        setBulkProgress(null);
        notification.warning({ message: indexMessages.disabled });
        return;
      }
    }
    setBulkProgress(null);

    const summary = `${counts.indexed} indexados, ${counts.removed} removidos (não publicados)`;
    if (counts.failed) {
      notification.error({
        message: `${summary}, ${counts.failed} com erro. Tente indexá-los novamente.`,
      });
    } else {
      notification.success({ message: `${summary}.` });
    }
  };

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
          {record.trainingItems.length > 0 && (
            <Tag color="purple">
              {record.trainingItems.length === 1
                ? "1 aula de treinamento"
                : `${record.trainingItems.length} aulas de treinamento`}
            </Tag>
          )}
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
      width: 140,
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
          <Tooltip title="Indexar para o assistente N0">
            <Button
              icon={<CloudSyncOutlined />}
              loading={indexing === record.id}
              disabled={bulkProgress !== null}
              onClick={() => indexOne(record.id)}
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
            icon={<CloudSyncOutlined />}
            loading={bulkProgress !== null}
            disabled={!list.length || indexing !== null}
            onClick={indexAll}
          >
            {bulkProgress !== null
              ? `Indexando ${bulkProgress + 1} de ${list.length}`
              : "Indexar todos"}
          </Button>
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
