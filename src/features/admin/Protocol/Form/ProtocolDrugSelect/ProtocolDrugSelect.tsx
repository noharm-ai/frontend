import { useEffect, useId, useState } from "react";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { Flex } from "antd";
import { LoadingOutlined, TableOutlined } from "@ant-design/icons";

import { Select } from "components/Inputs";
import Button from "components/Button";
import LoadBox from "components/LoadBox";
import api from "services/api";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";

import { DrugOption, formatDrugLabel, normalizeDrug } from "./helpers";
import { ProtocolDrugModal } from "./ProtocolDrugModal";

interface ProtocolDrugSelectProps {
  value?: Array<string | number>;
  onChange: (ids: Array<string | number>) => void;
}

export function ProtocolDrugSelect({
  value,
  onChange,
}: ProtocolDrugSelectProps) {
  const { t } = useTranslation();
  const containerId = `protocol-drug-select-${useId().replace(/:/g, "")}`;
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<DrugOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // The value can arrive as a non-array (e.g. a stale string left by the
  // free-text input shown before an operator is picked); ignore anything that
  // is not a proper id list.
  const ids = Array.isArray(value) ? value : [];
  const idsKey = ids.join(",");

  // Resolve names for the saved ids only — never fetch the whole table.
  useEffect(() => {
    const missing = ids.map(String).filter((id) => !(id in labelMap));

    if (!missing.length) return;

    setResolving(true);
    api.drugs
      .resolveDrugs(missing)
      .then((response) => {
        const items: DrugOption[] = (response.data?.data ?? []).map(
          normalizeDrug,
        );

        setLabelMap((prev) => {
          const next = { ...prev };
          items.forEach((item) => {
            next[String(item.id)] = formatDrugLabel(item);
          });
          // Ids with no match (e.g. a removed drug) fall back to the bare id so
          // the effect does not keep re-requesting them.
          missing.forEach((id) => {
            if (!(id in next)) next[id] = id;
          });
          return next;
        });
      })
      .catch((err) => {
        notification.error({
          message: getErrorMessageFromException(err.response?.data, t),
        });
      })
      .finally(() => setResolving(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const fetchData = (term: string) => {
    setLoading(true);
    api.drugs
      .findDrugs(term)
      .then((response) => {
        setOptions((response.data?.data ?? []).map(normalizeDrug));
      })
      .catch((err) => {
        notification.error({
          message: getErrorMessageFromException(err.response?.data, t),
        });
      })
      .finally(() => setLoading(false));
  };

  const search = debounce((term: string) => {
    if (term.length < 2) return;
    fetchData(term);
  }, 800);

  const handleChange = (selected: any) => {
    const picked: Array<{ value: any; label: any }> = selected ?? [];

    // Keep the label of each freshly-picked drug so its tag survives the
    // re-render that rebuilds the value from plain ids.
    setLabelMap((prev) => {
      const next = { ...prev };
      picked.forEach((s) => {
        if (s.label != null) next[String(s.value)] = s.label;
      });
      return next;
    });

    onChange(picked.map((s) => s.value));
  };

  const selectValue = ids.map((id) => ({
    value: id,
    label: labelMap[String(id)] ?? String(id),
  }));

  const applyModalSelection = (
    selectedIds: string[],
    labelAdditions: Record<string, string>,
  ) => {
    setLabelMap((prev) => ({ ...prev, ...labelAdditions }));
    onChange(selectedIds);
    setModalOpen(false);
  };

  return (
    <Flex gap={8} align="flex-start" style={{ width: "100%" }}>
      <div style={{ flex: 1, minWidth: 0 }} id={containerId}>
        <Select
          labelInValue
          allowClear
          mode="multiple"
          value={selectValue}
          style={{ width: "100%" }}
          notFoundContent={loading ? <LoadBox /> : null}
          onChange={handleChange}
          placeholder={loading ? "Carregando..." : "Digite para pesquisar"}
          loading={loading || resolving}
          getPopupContainer={() =>
            document.getElementById(containerId) as HTMLElement
          }
          showSearch={{
            onSearch: (term: string) => search(term),
            filterOption: false,
            autoClearSearchValue: false,
          }}
        >
          {options.map((option) => (
            <Select.Option value={option.id} key={option.id}>
              {formatDrugLabel(option)}
            </Select.Option>
          ))}
        </Select>
      </div>
      {(loading || resolving) && (
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

      <ProtocolDrugModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedIds={ids}
        labelMap={labelMap}
        onConfirm={applyModalSelection}
      />
    </Flex>
  );
}
