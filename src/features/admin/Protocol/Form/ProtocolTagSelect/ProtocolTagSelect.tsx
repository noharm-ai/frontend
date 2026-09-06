import { useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Flex } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { Select } from "components/Inputs";
import api from "services/api";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";
import { TagTypeEnum } from "models/TagTypeEnum";

interface TagOption {
  name: string;
  active: boolean;
}

interface ProtocolTagSelectProps {
  value?: Array<string | number>;
  onChange: (names: Array<string | number>) => void;
}

export function ProtocolTagSelect({ value, onChange }: ProtocolTagSelectProps) {
  const { t } = useTranslation();
  const containerId = `protocol-tag-select-${useId().replace(/:/g, "")}`;
  const [tags, setTags] = useState<TagOption[]>([]);
  // Starts true because we always fetch on mount; flipped off in `.finally`.
  const [loading, setLoading] = useState(true);

  // Patient tags (marcador table) are a small bounded set keyed by name, so we
  // load them once and let the Select filter client-side. Inactive tags are
  // kept so a saved protocol still shows every tag it references.
  useEffect(() => {
    api.tags
      .getTags({ tagType: TagTypeEnum.PATIENT })
      .then((response) => {
        setTags(
          (response.data?.data ?? [])
            .filter((tag: any) => tag?.name)
            .map((tag: any) => ({
              name: String(tag.name),
              active: tag.active !== false,
            })),
        );
      })
      .catch((err) => {
        notification.error({
          message: getErrorMessageFromException(err.response?.data, t),
        });
      })
      .finally(() => setLoading(false));
  }, [t]);

  // The value can arrive as a non-array (e.g. a stale string left before an
  // operator is picked); ignore anything that is not a proper name list.
  const names = (Array.isArray(value) ? value : []).map(String);

  const options = useMemo(() => {
    const known = tags.map((tag) => ({
      label: tag.active ? tag.name : `${tag.name} (inativo)`,
      value: tag.name,
    }));
    // A saved name that is no longer listed (e.g. removed tag) still needs an
    // option so the Select can render it instead of dropping it silently.
    const knownNames = new Set(tags.map((tag) => tag.name));
    const orphans = names
      .filter((name) => !knownNames.has(name))
      .map((name) => ({ label: name, value: name }));

    return [...known, ...orphans];
  }, [tags, names]);

  return (
    <Flex gap={8} align="flex-start" style={{ width: "100%" }}>
      <div style={{ flex: 1, minWidth: 0 }} id={containerId}>
        <Select
          value={names}
          onChange={(val) => onChange(val as string[])}
          mode="multiple"
          showSearch
          allowClear
          optionFilterProp="label"
          options={options}
          style={{ width: "100%" }}
          placeholder="Selecione os marcadores"
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
    </Flex>
  );
}
