import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Select } from "components/Inputs";
import { CUSTOM_FORM_STORE_ID, CUSTOM_FORM_MEMORY_TYPE } from "utils/memory";
import { fetchMemoryThunk } from "features/memory/MemoryText/MemoryTextSlice";

// until the first fetch starts the forms count as loading
const NOT_LOADED = {
  isFetching: true,
  list: [],
};

export default function ChooseForm({ onChange }) {
  const dispatch = useDispatch();
  const { isFetching, list } =
    useSelector((state) => state.memoryText.stores[CUSTOM_FORM_STORE_ID]) ||
    NOT_LOADED;

  useEffect(() => {
    dispatch(
      fetchMemoryThunk({
        storeId: CUSTOM_FORM_STORE_ID,
        type: CUSTOM_FORM_MEMORY_TYPE,
      }),
    );
  }, [dispatch]);

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
