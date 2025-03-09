import { useTranslation } from "react-i18next";
import { Empty, Spin } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import { Select } from "components/Inputs";
import { getProtocols } from "features/lists/ListsSlice";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

interface IFieldProtocolProps {
  value: number;
  onChange: (value: number) => void;
  protocolType: number;
}

export function FieldProtocol({
  value,
  onChange,
  protocolType,
}: IFieldProtocolProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const options = useAppSelector((state) => state.lists.getProtocols.list);
  const status = useAppSelector((state) => state.lists.getProtocols.status);

  const fetchProtocols = () => {
    if (protocolType && options.length === 0) {
      // @ts-expect-error ts 2554 (legacy code)
      dispatch(getProtocols({ protocolType, active: true })).then(
        (response: any) => {
          if (response.error) {
            notification.error({
              message: getErrorMessage(response, t),
              description: "protocolos",
            });
          }
        }
      );
    }
  };

  const selectOptions = options.map((o: { id: number; name: string }) => ({
    value: o.id,
    label: o.name,
  }));

  return (
    <Select
      showSearch
      allowClear
      value={value}
      optionFilterProp="label"
      style={{ minWidth: "300px", maxWidth: "100%" }}
      filterOption={true}
      onChange={(value) => onChange(value as number)}
      mode="multiple"
      loading={status === "loading"}
      placeholder="Selecione os protocolos"
      onClick={fetchProtocols}
      notFoundContent={status === "loading" ? <Spin size="small" /> : <Empty />}
      options={selectOptions}
    ></Select>
  );
}
