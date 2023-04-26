import React, { useState } from "react";
import debounce from "lodash.debounce";

import { Select } from "components/Inputs";
import LoadBox from "components/LoadBox";
import { store } from "store/index";
import api from "services/api";

export default function SubstanceField({ question, setFieldValue }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (value) => {
    setLoading(true);

    const state = store.getState();
    const access_token = state.auth.identify.access_token;
    const { data } = await api.findSubstances(access_token, value);

    setLoading(false);

    if (data.status === "success" && data.data && data.data.length) {
      setOptions(data.data);
    }
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
    >
      {options.map((option) => (
        <Select.Option value={option.name} key={option.name}>
          {option.name}
        </Select.Option>
      ))}
    </Select>
  );
}
