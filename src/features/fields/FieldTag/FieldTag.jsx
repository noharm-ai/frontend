import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { Select } from "components/Inputs";
import { getTags } from "features/lists/ListsSlice";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

export function FieldTag({ value, onChange, tagType, ...props }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const options = useSelector((state) => state.lists.getTags.list);
  const status = useSelector((state) => state.lists.getTags.status);

  useEffect(() => {
    if (tagType && options.length === 0) {
      dispatch(getTags({ tagType, active: true })).then((response) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
            description: "tags",
          });
        }
      });
    }
  }, [dispatch, t, tagType, options.length]);

  return (
    <Select
      showSearch
      allowClear
      value={value}
      optionFilterProp="children"
      style={{ minWidth: "300px", maxWidth: "100%" }}
      filterOption={false}
      onChange={(value) => onChange(value)}
      mode="multiple"
      loading={status === "loading"}
      placeholder="Selecione os marcadores"
      {...props}
    >
      {options.map((option) => (
        <Select.Option value={option.name} key={option.name}>
          {option.name}
        </Select.Option>
      ))}
    </Select>
  );
}
