import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { LoadingOutlined } from "@ant-design/icons";

import { Select } from "components/Inputs";
import LoadBox from "components/LoadBox";
import { searchSubstanceClasses } from "features/lists/ListsSlice";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { Flex } from "antd";

export default function FieldSubstanceClassAutocomplete({
  value,
  onChange,
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
          id: i.value,
          name: i.label,
        }))
      );
    }
  }, [value]); //eslint-disable-line

  const fetchData = async (value) => {
    setLoading(true);

    dispatch(searchSubstanceClasses({ term: value })).then((response) => {
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
    if (value.length < 2) return;
    fetchData(value);
  }, 800);

  return (
    <Flex>
      <div style={{ flex: 1, maxWidth: "100%" }} id="class-autocomplete">
        <Select
          labelInValue
          allowClear
          value={value}
          style={{ minWidth: "300px", maxWidth: "100%" }}
          notFoundContent={loading ? <LoadBox /> : null}
          onChange={(value) => onChange(value)}
          placeholder={loading ? "Carregando..." : "Digite para pesquisar"}
          mode="multiple"
          loading={loading}
          getPopupContainer={() =>
            document.getElementById("class-autocomplete")
          }
          showSearch={{
            onSearch: (value) => search(value),
            filterOption: false,
            optionFilterProp: ["children"],
            autoClearSearchValue: false,
          }}
          {...props}
        >
          {options.map((option) => (
            <Select.Option value={option.id} key={option.id}>
              {option.parent
                ? `${option.parent} - ${option.name}`
                : option.name}
            </Select.Option>
          ))}
        </Select>
      </div>
      {loading && (
        <div style={{ width: "30px" }}>
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <LoadingOutlined />
          </Flex>
        </div>
      )}
    </Flex>
  );
}
