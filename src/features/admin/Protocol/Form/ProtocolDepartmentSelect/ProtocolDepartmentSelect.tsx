import { useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Flex } from "antd";
import { LoadingOutlined, TableOutlined } from "@ant-design/icons";

import { Select } from "components/Inputs";
import Button from "components/Button";
import api from "services/admin/api";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";

import {
  DepartmentOption,
  formatDepartmentLabel,
  normalizeDepartment,
} from "./helpers";
import { ProtocolDepartmentModal } from "./ProtocolDepartmentModal";

interface ProtocolDepartmentSelectProps {
  value?: Array<string | number>;
  onChange: (ids: Array<string | number>) => void;
}

export function ProtocolDepartmentSelect({
  value,
  onChange,
}: ProtocolDepartmentSelectProps) {
  const { t } = useTranslation();
  const containerId = `protocol-department-select-${useId().replace(/:/g, "")}`;
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  // Starts true because we always fetch on mount; flipped off in `.finally`.
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // The department list (distinct fksetor) is a bounded operational set, so we
  // load it once and let the Select filter client-side. This also resolves the
  // labels for already-saved ids for free.
  useEffect(() => {
    api.protocols
      .getDepartments({})
      .then((response) => {
        setDepartments((response.data?.data ?? []).map(normalizeDepartment));
      })
      .catch((err) => {
        notification.error({
          message: getErrorMessageFromException(err.response?.data, t),
        });
      })
      .finally(() => setLoading(false));
  }, [t]);

  const options = useMemo(
    () =>
      departments.map((d) => ({
        label: formatDepartmentLabel(d),
        value: d.id,
      })),
    [departments],
  );

  // The value can arrive as a non-array (e.g. a stale string left before an
  // operator is picked); ignore anything that is not a proper id list.
  const ids = (Array.isArray(value) ? value : []).map(String);

  return (
    <Flex gap={8} align="flex-start" style={{ width: "100%" }}>
      <div style={{ flex: 1, minWidth: 0 }} id={containerId}>
        <Select
          value={ids}
          onChange={(val) => onChange(val as string[])}
          mode="multiple"
          showSearch
          allowClear
          optionFilterProp="label"
          options={options}
          style={{ width: "100%" }}
          placeholder="Digite para pesquisar"
          loading={loading}
          maxTagCount={10}
          getPopupContainer={() =>
            document.getElementById(containerId) as HTMLElement
          }
        />
      </div>
      {loading && (
        <div style={{ width: "30px", flexShrink: 0 }}>
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <LoadingOutlined />
          </Flex>
        </div>
      )}
      <Button
        icon={<TableOutlined />}
        title="Pesquisar em tabela"
        style={{ flexShrink: 0 }}
        onClick={() => setModalOpen(true)}
      />

      <ProtocolDepartmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        departments={departments}
        loading={loading}
        selectedIds={ids}
        onConfirm={(selectedIds) => {
          onChange(selectedIds);
          setModalOpen(false);
        }}
      />
    </Flex>
  );
}
