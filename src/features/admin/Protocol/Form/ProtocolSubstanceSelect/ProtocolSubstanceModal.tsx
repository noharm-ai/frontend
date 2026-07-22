import { useEffect, useState } from "react";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { Table, Tag, Flex, Empty } from "antd";

import DefaultModal from "components/Modal";
import { Input } from "components/Inputs";
import api from "services/api";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";

import {
  SubstanceOption,
  formatSubstanceLabel,
  normalizeSubstance,
} from "./helpers";

interface ProtocolSubstanceModalProps {
  open: boolean;
  onClose: () => void;
  selectedIds: Array<string | number>;
  labelMap: Record<string, string>;
  onConfirm: (ids: string[], labelAdditions: Record<string, string>) => void;
}

export function ProtocolSubstanceModal({
  open,
  onClose,
  selectedIds,
  labelMap,
  onConfirm,
}: ProtocolSubstanceModalProps) {
  const { t } = useTranslation();
  const [term, setTerm] = useState("");
  const [rows, setRows] = useState<SubstanceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedItemsById, setSelectedItemsById] = useState<
    Record<string, SubstanceOption>
  >({});

  // Re-seed from the current selection every time the modal is opened so a
  // second open never shows stale checkboxes.
  useEffect(() => {
    if (open) {
      setSelectedKeys((selectedIds ?? []).map(String));
      setSelectedItemsById({});
      setTerm("");
      setRows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchData = (value: string) => {
    setLoading(true);
    api.substance
      .findSubstances(value)
      .then((response) => {
        setRows((response.data?.data ?? []).map(normalizeSubstance));
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
    onChange: (keys: React.Key[], selectedRows: SubstanceOption[]) => {
      const nextKeys = keys.map(String);
      setSelectedKeys(nextKeys);

      // antd hands back undefined rows for preserved keys not in the current
      // results, so keep the item we already knew for those.
      setSelectedItemsById((prev) => {
        const next: Record<string, SubstanceOption> = {};
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

  const confirm = () => {
    const additions: Record<string, string> = {};
    Object.values(selectedItemsById).forEach((item) => {
      additions[String(item.id)] = formatSubstanceLabel(item);
    });

    onConfirm(selectedKeys, additions);
  };

  const columns = [
    {
      title: "SCTID",
      dataIndex: "id",
      key: "id",
      width: 160,
    },
    {
      title: "Substância",
      dataIndex: "name",
      key: "name",
    },
  ];

  const selectedLabels = selectedKeys.map((key) =>
    selectedItemsById[key]
      ? formatSubstanceLabel(selectedItemsById[key])
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
        <h2 className="modal-title">Selecionar substâncias</h2>
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
        locale={{
          emptyText:
            term.length < 2
              ? "Digite para pesquisar substâncias"
              : "Nenhuma substância encontrada",
        }}
      />

      <div style={{ marginTop: "1rem" }}>
        <div style={{ marginBottom: "0.5rem", fontWeight: 500 }}>
          Substâncias selecionadas ({selectedKeys.length})
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
              description="Nenhuma substância selecionada"
              style={{ margin: "0.5rem 0" }}
            />
          ) : (
            <Flex wrap gap={4}>
              {selectedKeys.map((key, i) => (
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
