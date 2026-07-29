import { useState } from "react";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { Table, Tag, Flex, Empty } from "antd";

import DefaultModal from "components/Modal";
import { Input } from "components/Inputs";
import api from "services/api";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";

import { DrugOption, formatDrugLabel, normalizeDrug } from "./helpers";

interface ProtocolDrugModalProps {
  open: boolean;
  onClose: () => void;
  selectedIds: Array<string | number>;
  labelMap: Record<string, string>;
  onConfirm: (ids: string[], labelAdditions: Record<string, string>) => void;
}

export function ProtocolDrugModal({
  open,
  onClose,
  selectedIds,
  labelMap,
  onConfirm,
}: ProtocolDrugModalProps) {
  const { t } = useTranslation();
  const [term, setTerm] = useState("");
  const [rows, setRows] = useState<DrugOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() =>
    (selectedIds ?? []).map(String),
  );
  const [selectedItemsById, setSelectedItemsById] = useState<
    Record<string, DrugOption>
  >({});

  // Re-seed the working selection whenever the modal transitions to open, so a
  // second open never shows stale checkboxes. Tracking the previous `open` and
  // adjusting state during render is React's recommended alternative to a reset
  // effect — no extra render commit and no dependency-lint escape hatch.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelectedKeys((selectedIds ?? []).map(String));
      setSelectedItemsById({});
      setTerm("");
      setRows([]);
    }
  }

  const fetchData = (value: string) => {
    setLoading(true);
    api.drugs
      .findDrugs(value)
      .then((response) => {
        setRows((response.data?.data ?? []).map(normalizeDrug));
      })
      .catch((err) => {
        notification.error({
          message: getErrorMessageFromException(err.response?.data, t),
        });
      })
      .finally(() => setLoading(false));
  };

  const search = debounce((value: string) => {
    if (value.length < 2) {
      setRows([]);
      return;
    }
    fetchData(value);
  }, 500);

  const onSearchChange = (value: string) => {
    setTerm(value);
    search(value);
  };

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    preserveSelectedRowKeys: true,
    onChange: (keys: React.Key[], selectedRows: DrugOption[]) => {
      const nextKeys = keys.map(String);
      setSelectedKeys(nextKeys);

      // antd hands back undefined rows for preserved keys not in the current
      // results, so keep the item we already knew for those.
      setSelectedItemsById((prev) => {
        const next: Record<string, DrugOption> = {};
        nextKeys.forEach((key) => {
          const fromRows = (selectedRows ?? []).find(
            (r) => r && String(r.id) === key,
          );
          const item = fromRows ?? prev[key];
          if (item) next[key] = item;
        });
        return next;
      });
    },
  };

  const removeSelected = (key: string) => {
    setSelectedKeys((prev) => prev.filter((k) => k !== key));
    setSelectedItemsById((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Let a click anywhere on the row toggle its selection, not only the checkbox.
  const toggleRow = (record: DrugOption) => {
    const key = String(record.id);
    if (selectedKeys.includes(key)) {
      removeSelected(key);
    } else {
      setSelectedKeys((prev) => [...prev, key]);
      setSelectedItemsById((prev) => ({ ...prev, [key]: record }));
    }
  };

  const confirm = () => {
    const additions: Record<string, string> = {};
    Object.values(selectedItemsById).forEach((item) => {
      additions[String(item.id)] = formatDrugLabel(item);
    });

    onConfirm(selectedKeys, additions);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 160,
    },
    {
      title: "Medicamento",
      dataIndex: "name",
      key: "name",
    },
  ];

  const selectedLabels = selectedKeys.map((key) =>
    selectedItemsById[key]
      ? formatDrugLabel(selectedItemsById[key])
      : (labelMap[key] ?? key),
  );

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
        <h2 className="modal-title">Selecionar medicamentos</h2>
      </header>

      <div style={{ marginBottom: "1rem" }}>
        <Input.Search
          allowClear
          value={term}
          placeholder="Digite ao menos 2 caracteres para pesquisar"
          loading={loading}
          onChange={({ target }) => onSearchChange(target.value)}
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
        onRow={(record) => ({
          onClick: (e) => {
            // The checkbox column toggles on its own; ignore those clicks so a
            // checkbox tap does not immediately toggle back.
            if (
              (e.target as HTMLElement).closest(".ant-table-selection-column")
            ) {
              return;
            }
            toggleRow(record);
          },
          style: { cursor: "pointer" },
        })}
        locale={{
          emptyText:
            term.length < 2
              ? "Digite para pesquisar medicamentos"
              : "Nenhum medicamento encontrado",
        }}
      />

      <div style={{ marginTop: "1rem" }}>
        <div style={{ marginBottom: "0.5rem", fontWeight: 500 }}>
          Medicamentos selecionados ({selectedKeys.length})
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
              description="Nenhum medicamento selecionado"
              style={{ margin: "0.5rem 0" }}
            />
          ) : (
            <Flex wrap gap={4}>
              {selectedKeys.map((key, i) => (
                <Tag
                  key={key}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    removeSelected(key);
                  }}
                  style={{ marginInlineEnd: 0, padding: "2px 8px" }}
                  color="#a991d6"
                >
                  {selectedLabels[i]}
                </Tag>
              ))}
            </Flex>
          )}
        </div>
      </div>
    </DefaultModal>
  );
}
