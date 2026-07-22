import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, Tag, Flex, Empty } from "antd";

import DefaultModal from "components/Modal";
import { Input } from "components/Inputs";

import { DepartmentOption, formatDepartmentLabel } from "./helpers";

interface ProtocolDepartmentModalProps {
  open: boolean;
  onClose: () => void;
  departments: DepartmentOption[];
  loading: boolean;
  selectedIds: Array<string | number>;
  onConfirm: (ids: string[]) => void;
}

export function ProtocolDepartmentModal({
  open,
  onClose,
  departments,
  loading,
  selectedIds,
  onConfirm,
}: ProtocolDepartmentModalProps) {
  const { t } = useTranslation();
  const [term, setTerm] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() =>
    (selectedIds ?? []).map(String),
  );

  // Re-seed the working selection whenever the modal transitions to open, so a
  // second open never shows stale checkboxes. Tracking the previous `open` and
  // adjusting state during render is React's recommended alternative to a reset
  // effect — no extra render commit and no dependency-lint escape hatch.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelectedKeys((selectedIds ?? []).map(String));
      setTerm("");
    }
  }

  // The full list is already loaded, so filter it client-side by name or id.
  const rows = useMemo(() => {
    const query = term.trim().toLowerCase();
    if (!query) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        String(d.id).toLowerCase().includes(query),
    );
  }, [term, departments]);

  const labelById = useMemo(() => {
    const map: Record<string, string> = {};
    departments.forEach((d) => {
      map[String(d.id)] = formatDepartmentLabel(d);
    });
    return map;
  }, [departments]);

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    preserveSelectedRowKeys: true,
    onChange: (keys: React.Key[]) => {
      setSelectedKeys(keys.map(String));
    },
  };

  const removeSelected = (key: string) => {
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
  };

  const confirm = () => {
    onConfirm(selectedKeys);
  };

  const columns = [
    {
      title: "Setor (fksetor)",
      dataIndex: "id",
      key: "id",
      width: 160,
    },
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
    },
  ];

  return (
    <DefaultModal
      open={open}
      width={"60vw"}
      centered
      destroyOnHidden
      maskClosable={false}
      onCancel={onClose}
      onOk={confirm}
      okText={t("actions.save")}
      cancelText={t("actions.cancel")}
    >
      <header>
        <h2 className="modal-title">Selecionar setores</h2>
      </header>

      <div style={{ marginBottom: "1rem" }}>
        <Input.Search
          allowClear
          value={term}
          placeholder="Digite para filtrar por nome ou fksetor"
          onChange={({ target }) => setTerm(target.value)}
        />
      </div>

      <Table
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={rows}
        loading={loading}
        rowSelection={rowSelection}
        pagination={false}
        scroll={{ y: "45vh" }}
        locale={{
          emptyText: "Nenhum setor encontrado",
        }}
      />

      <div style={{ marginTop: "1rem" }}>
        <div style={{ marginBottom: "0.5rem", fontWeight: 500 }}>
          Setores selecionados ({selectedKeys.length})
        </div>
        <div
          style={{
            maxHeight: "140px",
            overflowY: "auto",
            border: "1px solid var(--nh-border-color, #f0f0f0)",
            borderRadius: "8px",
            padding: "0.5rem",
            background: "var(--nh-bg-subtle, #fafafa)",
          }}
        >
          {selectedKeys.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Nenhum setor selecionado"
              style={{ margin: "0.5rem 0" }}
            />
          ) : (
            <Flex wrap gap={4}>
              {selectedKeys.map((key) => (
                <Tag
                  key={key}
                  closable
                  color="#a991d6"
                  onClose={(e) => {
                    e.preventDefault();
                    removeSelected(key);
                  }}
                  style={{ marginInlineEnd: 0, padding: "2px 8px" }}
                >
                  {labelById[key] ?? key}
                </Tag>
              ))}
            </Flex>
          )}
        </div>
      </div>
    </DefaultModal>
  );
}
