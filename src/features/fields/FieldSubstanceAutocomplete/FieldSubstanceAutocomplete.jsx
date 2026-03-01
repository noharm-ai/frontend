import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";

import { Select } from "components/Inputs";
import LoadBox from "components/LoadBox";
import { searchSubstances } from "features/lists/ListsSlice";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

export default function FieldSubstanceAutocomplete({
  value,
  onChange,
  ...props
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [options, setOptions] = useState(() =>
    value && value.length
      ? value.map((i) => ({ id: i.value, name: i.label }))
      : [],
  );
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
    <div style={{ position: "relative" }} id="substance-autocomplete">
      <Select
        labelInValue
        allowClear
        value={value}
        style={{ minWidth: "300px" }}
        notFoundContent={loading ? <LoadBox /> : null}
        onChange={(value) => onChange(value)}
        placeholder={loading ? "Carregando..." : "Digite para pesquisar"}
        mode="multiple"
        loading={loading}
        getPopupContainer={() =>
          document.getElementById("substance-autocomplete")
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
          <Select.Option value={option.sctid} key={option.sctid}>
            {option.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
}
