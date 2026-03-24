import React, { useEffect } from "react";

import { Select } from "components/Inputs";
import { CUSTOM_FORM_STORE_ID, CUSTOM_FORM_MEMORY_TYPE } from "utils/memory";

export default function ChooseForm({ fetchMemory, memory, onChange }) {
  const { isFetching, list } = memory[CUSTOM_FORM_STORE_ID] || {
    isFetching: true,
    list: [],
  };

  useEffect(() => {
    fetchMemory(CUSTOM_FORM_STORE_ID, CUSTOM_FORM_MEMORY_TYPE);
  }, [fetchMemory]);

  const sortForms = (a, b) =>
    `${a?.value?.name}`.localeCompare(`${b?.value?.name}`);

  const activeForms = list
    ? list.filter((option) => option?.value?.active !== false).sort(sortForms)
    : [];

  const change = (key) => {
    onChange(activeForms.find((f) => f.key === key).value);
  };

  return (
    <Select
      placeholder="Pesquisar"
      style={{ width: "100%" }}
      loading={isFetching}
      showSearch
      optionFilterProp="children"
      onChange={(value) => change(value)}
    >
      {activeForms.map((option) => (
        <Select.Option value={option.key} key={option.key}>
          {option.value.name}
        </Select.Option>
      ))}
    </Select>
  );
}
