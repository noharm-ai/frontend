import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Space, Modal, List, Tooltip } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import Table from "components/Table";
import Button from "components/Button";
import BackTop from "components/BackTop";
import notification from "components/notification";
import { PageCard } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";
import { KIND_META } from "features/memory/MemoryEditor/editors/registry";

import { fetchEditableMemories, reset } from "./MemoryListSlice";

const BASE_PATH = "/configuracoes/memoria";

function MemoryList() {
  const dispatch = useAppDispatch() as any;
  const navigate = useNavigate();
  const [kindModalOpen, setKindModalOpen] = useState(false);

  const records: any[] = useAppSelector(
    (state: any) => state.memoryList.records,
  );
  const status = useAppSelector((state: any) => state.memoryList.status);

  useEffect(() => {
    dispatch(fetchEditableMemories());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (status === "failed") {
    notification.error({
      message: "Erro",
      description: "Não foi possível carregar os registros.",
    });
  }

  const handleNewClick = () => {
    setKindModalOpen(true);
  };

  const handleKindSelect = (kind: string) => {
    setKindModalOpen(false);
    navigate(`${BASE_PATH}/new?kind=${kind}`);
  };

  const existingKinds = new Set(records.map((r: any) => r.value?.kind));

  const kindOptions = Object.entries(KIND_META).map(([k, meta]) => ({
    kind: k,
    label: meta.label,
    disabled: existingKinds.has(k),
  }));

  const allKindsTaken =
    kindOptions.length > 0 && kindOptions.every((o) => o.disabled);

  const columns = [
    {
      title: "Tipo",
      dataIndex: "kind",
      render: (kind: string) => KIND_META[kind]?.label ?? kind,
    },
    {
      title: "Atualizado em",
      dataIndex: "updatedAt",
      width: 160,
      render: (v: string) => (v ? new Date(v).toLocaleString("pt-BR") : "-"),
    },
    {
      title: "Ativo",
      align: "center" as const,
      width: 90,
      render: (_: any, record: any) =>
        record.active !== false ? (
          <Tag color="green">Sim</Tag>
        ) : (
          <Tag color="red">Não</Tag>
        ),
    },
    {
      title: "Ações",
      key: "operations",
      width: 120,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`${BASE_PATH}/${record.key}`)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Memória</h1>
          <div className="page-header-legend">
            Gerencie modelos e textos de memória
          </div>
        </div>
        <div className="page-header-actions">
          {!allKindsTaken && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewClick}
            >
              Novo registro
            </Button>
          )}
        </div>
      </PageHeader>

      <PageCard>
        <Table
          columns={columns}
          dataSource={[...records]
            .sort((a: any, b: any) =>
              (a.value?.name ?? "").localeCompare(b.value?.name ?? ""),
            )
            .map((r: any) => ({
              ...r.value,
              key: r.key,
              updatedAt: r.updatedAt,
            }))}
          loading={status === "loading"}
          pagination={false}
          locale={{ emptyText: "Nenhum registro cadastrado" }}
        />
      </PageCard>

      <Modal
        title="Selecionar tipo de registro"
        open={kindModalOpen}
        onCancel={() => setKindModalOpen(false)}
        footer={null}
        width={400}
      >
        <List
          dataSource={kindOptions}
          renderItem={(item) => (
            <Tooltip
              title={
                item.disabled ? "Já existe um registro deste tipo" : undefined
              }
            >
              <List.Item
                style={{
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  opacity: item.disabled ? 0.45 : 1,
                }}
                onClick={() => !item.disabled && handleKindSelect(item.kind)}
              >
                {item.label}
              </List.Item>
            </Tooltip>
          )}
        />
      </Modal>

      <BackTop />
    </>
  );
}

export default MemoryList;
