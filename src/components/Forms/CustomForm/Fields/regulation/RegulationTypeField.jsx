import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { Select } from "components/Inputs";
import { getRegulationTypes } from "features/lists/ListsSlice";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

export default function RegulationTypeField({
  question,
  values,
  setFieldValue,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      dispatch(getRegulationTypes()).then((response) => {
        setLoading(false);

        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          const { data } = response.payload;

          if (data.length) {
            setOptions([...data]);
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
      loading={loading}
      disabled={loading || question.disabled}
      optionFilterProp="children"
      showSearch
      labelInValue
    >
      {options.map(({ id, name }) => (
        <Select.Option value={id} key={id}>
          {name}
        </Select.Option>
      ))}
    </Select>
  );
}
