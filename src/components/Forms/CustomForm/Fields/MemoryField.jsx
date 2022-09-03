import React, { useEffect, useState } from "react";

import { Select } from "components/Inputs";
import { store } from "store/index";
import api from "services/api";

export default function MemoryField({ question, values, setFieldValue }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const state = store.getState();
      const access_token = state.auth.identify.access_token;
      const { data } = await api.getMemory(access_token, `cf-${question.id}`);

      setLoading(false);

      if (data.status === "success" && data.data && data.data.length) {
        setOptions(data.data[0].value.sort());
      }
    };

    fetchData();
  }, [question.id]);

  return (
    <Select
      placeholder={loading ? "Carregando..." : "Selecione..."}
      onChange={(value) => setFieldValue(question.id, value)}
      value={values[question.id] ? values[question.id] : []}
      allowClear
      style={{ minWidth: "300px" }}
      mode={question.type === "memory-multiple" ? "multiple" : "default"}
      loading={loading}
      disabled={loading}
    >
      {options.map((option) => (
        <Select.Option value={option} key={option}>
          {option}
        </Select.Option>
      ))}
    </Select>
  );
}
