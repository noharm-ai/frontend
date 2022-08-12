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

  const change = (index) => {
    onChange(list[index].value);
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
      {list &&
        list.map((option, index) => (
          <Select.Option value={index} key={option.key}>
            {option.value.name}
          </Select.Option>
        ))}
    </Select>
  );
}
