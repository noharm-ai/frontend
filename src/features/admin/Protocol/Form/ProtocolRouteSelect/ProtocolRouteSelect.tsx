import { useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Flex } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { Select } from "components/Inputs";
import api from "services/api";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";

interface RouteOption {
  id: string;
  name: string;
}

interface ProtocolRouteSelectProps {
  value?: Array<string | number>;
  onChange: (ids: Array<string | number>) => void;
}

export function ProtocolRouteSelect({
  value,
  onChange,
}: ProtocolRouteSelectProps) {
  const { t } = useTranslation();
  const containerId = `protocol-route-select-${useId().replace(/:/g, "")}`;
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  // Starts true because we always fetch on mount; flipped off in `.finally`.
  const [loading, setLoading] = useState(true);

  // The route list (map-routes memory) is a bounded operational set, so we load
  // it once and let the Select filter client-side. This also resolves the
  // labels for already-saved ids for free.
  useEffect(() => {
    api.lists
      .getRoutes()
      .then((response) => {
        setRoutes(
          (response.data?.data ?? [])
            .filter((r: any) => r?.id != null)
            .map((r: any) => ({
              id: String(r.id),
              name: r.name != null ? String(r.name) : String(r.id),
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

  const options = useMemo(
    () =>
      routes.map((r) => ({
        label: r.name === r.id ? r.id : `${r.name} (${r.id})`,
        value: r.id,
      })),
    [routes],
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
    </Flex>
  );
}
