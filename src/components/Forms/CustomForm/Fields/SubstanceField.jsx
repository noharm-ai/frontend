import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import debounce from "lodash.debounce";

import { Select } from "components/Inputs";
import LoadBox from "components/LoadBox";
import { searchSubstances } from "features/lists/ListsSlice";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

export default function SubstanceField({ question, setFieldValue }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (value) => {
    setLoading(true);

    dispatch(searchSubstances({ term: value })).then((response) => {
      setLoading(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        const { data } = response.payload;
        if (data.length) {
          setOptions(data);
        }
      }
    });
  };

  const search = debounce((value) => {
    if (value.length < 3) return;
    fetchData(value);
  }, 800);

  return (
    <Select
      showSearch
      allowClear
      optionFilterProp="children"
      style={{ minWidth: "300px" }}
      notFoundContent={loading ? <LoadBox /> : null}
      filterOption={false}
      onSearch={search}
      onChange={(value) => setFieldValue(question.id, value)}
      placeholder={loading ? "Carregando..." : "Selecione..."}
      mode="multiple"
      disabled={question.disabled}
      loading={loading}
    >
      {options.map((option) => (
        <Select.Option value={option.name} key={option.name}>
          {option.name}
        </Select.Option>
      ))}
    </Select>
  );
}
