import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { Spin, Flex, Tag } from "antd";

import { Select } from "components/Inputs";
import LoadBox from "components/LoadBox";
import { searchNames } from "features/lists/ListsSlice";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { formatCpf } from "utils/number";
import { formatDate } from "utils/date";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";

export default function FieldNameAutocomplete({
  value,
  onChange,
  mode,
  ...props
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value && value.length && !options.length) {
      setOptions(
        value.map((i) => ({
          sctid: i.value,
          name: i.label,
        }))
      );
    }
  }, [value]); //eslint-disable-line

  const fetchData = async (value) => {
    setLoading(true);

    dispatch(searchNames({ term: value })).then((response) => {
      setLoading(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        const { data } = response.payload;

        setOptions(data);
      }
    });
  };

  const search = debounce((value) => {
    if (value.length < 3) return;
    fetchData(value);
  }, 800);

  return (
    <Flex align="center" gap={10}>
      <Select
        showSearch
        allowClear
        value={value}
        optionFilterProp="children"
        style={{ minWidth: "300px" }}
        notFoundContent={loading ? <LoadBox /> : "Nenhum resultado disponível"}
        filterOption={false}
        onSearch={search}
        onChange={(value) => onChange(value)}
        placeholder={loading ? "Carregando..." : "Digite para pesquisar"}
        mode={mode ?? "multiple"}
        loading={loading}
        {...props}
      >
        {options.map((option) => (
          <Select.Option value={option.idPatient} key={option.idPatient}>
            {option.name}{" "}
            {option.birthdate ? (
              <Tag style={{ marginLeft: "5px" }} color="blue">
                {formatDate(option.birthdate)}
              </Tag>
            ) : null}
            {option.number ? (
              <Tag style={{ marginLeft: "5px" }}>
                {formatCpf(option.number)}
              </Tag>
            ) : null}
          </Select.Option>
        ))}
        {FeatureService.has(Feature.STAGING_ACCESS) && (
          <Select.Option value={999}>Paciente Teste</Select.Option>
        )}
      </Select>
      <Spin spinning={loading} />
    </Flex>
  );
}
