import { useEffect, useState } from "react";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { Table } from "antd";

import DefaultModal from "components/Modal";
import { Input } from "components/Inputs";
import api from "services/api";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";

import { ClassOption, formatSubstanceClassLabel } from "./helpers";

interface ProtocolSubstanceClassModalProps {
  open: boolean;
  onClose: () => void;
  selectedIds: Array<string | number>;
  labelMap: Record<string, string>;
  onConfirm: (ids: string[], labelAdditions: Record<string, string>) => void;
}

export function ProtocolSubstanceClassModal({
  open,
  onClose,
  selectedIds,
  labelMap,
  onConfirm,
}: ProtocolSubstanceClassModalProps) {
  const { t } = useTranslation();
  const [term, setTerm] = useState("");
  const [rows, setRows] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedItemsById, setSelectedItemsById] = useState<
    Record<string, ClassOption>
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
      .findSubstanceClasses(value)
      .then((response) => {
        setRows(response.data?.data ?? []);
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
    onChange: (keys: React.Key[], selectedRows: ClassOption[]) => {
      const nextKeys = keys.map(String);
      setSelectedKeys(nextKeys);

      // antd hands back undefined rows for preserved keys not in the current
      // results, so keep the item we already knew for those.
      setSelectedItemsById((prev) => {
        const next: Record<string, ClassOption> = {};
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

  const confirm = () => {
    const additions: Record<string, string> = {};
    Object.values(selectedItemsById).forEach((item) => {
      additions[String(item.id)] = formatSubstanceClassLabel(item);
    });

    onConfirm(selectedKeys, additions);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Classe",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Classe pai",
      dataIndex: "parent",
      key: "parent",
      render: (parent: string | null) => parent ?? "-",
    },
  ];

  const selectedLabels = selectedKeys.map(
    (key) => selectedItemsById[key] ? formatSubstanceClassLabel(selectedItemsById[key]) : labelMap[key] ?? key,
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
        <h2 className="modal-title">Selecionar classes</h2>
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
              ? "Digite para pesquisar classes"
              : "Nenhuma classe encontrada",
        }}
      />

      <div style={{ marginTop: "1rem" }}>
        <strong>{selectedKeys.length}</strong> classe(s) selecionada(s)
        {selectedLabels.length > 0 && (
          <div style={{ opacity: 0.7, marginTop: "0.25rem" }}>
            {selectedLabels.join("; ")}
          </div>
        )}
      </div>
    </DefaultModal>
  );
}
