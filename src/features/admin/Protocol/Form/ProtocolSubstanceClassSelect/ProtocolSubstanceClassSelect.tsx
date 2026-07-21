import { useEffect, useId, useState } from "react";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { Flex } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { Select } from "components/Inputs";
import LoadBox from "components/LoadBox";
import api from "services/api";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";

interface ClassOption {
  id: string;
  name: string;
  parent?: string | null;
}

interface ProtocolSubstanceClassSelectProps {
  value?: Array<string | number>;
  onChange: (ids: Array<string | number>) => void;
}

const formatLabel = (option: ClassOption) => {
  const base = option.parent ? `${option.parent} - ${option.name}` : option.name;

  return `${option.id} - ${base}`;
};

export function ProtocolSubstanceClassSelect({
  value,
  onChange,
}: ProtocolSubstanceClassSelectProps) {
  const { t } = useTranslation();
  const containerId = `protocol-class-select-${useId().replace(/:/g, "")}`;
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);

  // The value can arrive as a non-array (e.g. a stale string left by the
  // free-text input shown before an operator is picked); ignore anything that
  // is not a proper id list.
  const ids = Array.isArray(value) ? value : [];
  const idsKey = ids.join(",");

  // Resolve names for the saved ids only — never fetch the whole class table.
  useEffect(() => {
    const missing = ids.map(String).filter((id) => !(id in labelMap));

    if (!missing.length) return;

    setResolving(true);
    api.substance
      .resolveSubstanceClasses(missing)
      .then((response) => {
        const items: ClassOption[] = response.data?.data ?? [];

        setLabelMap((prev) => {
          const next = { ...prev };
          items.forEach((item) => {
            next[String(item.id)] = formatLabel(item);
          });
          // Ids with no match (e.g. a deleted class) fall back to the bare id
          // so the effect does not keep re-requesting them.
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
    api.substance
      .findSubstanceClasses(term)
      .then((response) => {
        setOptions(response.data?.data ?? []);
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

    // Keep the label of each freshly-picked class so its tag survives the
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

  return (
    <Flex>
      <div style={{ flex: 1, maxWidth: "100%" }} id={containerId}>
        <Select
          labelInValue
          allowClear
          mode="multiple"
          value={selectValue}
          style={{ minWidth: "300px", maxWidth: "100%" }}
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
              {formatLabel(option)}
            </Select.Option>
          ))}
        </Select>
      </div>
      {(loading || resolving) && (
        <div style={{ width: "30px" }}>
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <LoadingOutlined />
          </Flex>
        </div>
      )}
    </Flex>
  );
}
