import { useTranslation } from "react-i18next";
import { Empty, Spin } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import { Select } from "components/Inputs";
import { getIcds } from "features/lists/ListsSlice";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

interface IFieldIcdProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function FieldIcd({ value, onChange }: IFieldIcdProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const options = useAppSelector((state) => state.lists.getIcds.list);
  const status = useAppSelector((state) => state.lists.getIcds.status);

  const fetchIcds = () => {
    if (options.length === 0) {
      dispatch(getIcds()).then((response: any) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        }
      });
    }
  };

  return (
    <Select
      showSearch
      allowClear
      value={value}
      optionFilterProp="children"
      style={{ minWidth: "300px", maxWidth: "100%" }}
      filterOption={true}
      onChange={(value: any) => onChange(value)}
      mode="multiple"
      loading={status === "loading"}
      placeholder="Selecione os CIDs"
      onClick={fetchIcds}
      maxTagCount="responsive"
      notFoundContent={status === "loading" ? <Spin size="small" /> : <Empty />}
    >
      {options.map((option: any) => (
        <Select.Option value={option.id} key={option.id}>
          {option.name}
        </Select.Option>
      ))}
    </Select>
  );
}
