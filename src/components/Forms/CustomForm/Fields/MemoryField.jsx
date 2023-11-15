import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { Select } from "components/Inputs";
import { getMemory } from "features/lists/ListsSlice";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

export default function MemoryField({ question, values, setFieldValue }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      dispatch(
        getMemory({ type: question.optionsSource || `cf-${question.id}` })
      ).then((response) => {
        setLoading(false);

        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          const { data } = response.payload;
          if (data.length) {
            setOptions([...data[0].value].sort());
          }
        }
      });
    };

    fetchData();
  }, []); //eslint-disable-line

  return (
    <Select
      placeholder={loading ? "Carregando..." : "Selecione..."}
      onChange={(value) => setFieldValue(question.id, value)}
      value={values[question.id] ? values[question.id] : []}
      allowClear
      style={{ minWidth: "300px", ...(question.style || {}) }}
      mode={question.type === "memory-multiple" ? "multiple" : "default"}
      loading={loading}
      disabled={loading || question.disabled}
    >
      {question.optionsType === "key-value"
        ? options.map(({ key, value }) => (
            <Select.Option value={key} key={key}>
              {value}
            </Select.Option>
          ))
        : options.map((option) => (
            <Select.Option value={option} key={option}>
              {option}
            </Select.Option>
          ))}
    </Select>
  );
}
