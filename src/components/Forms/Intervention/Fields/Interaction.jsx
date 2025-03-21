import React from "react";
import { isEmpty, uniqBy, debounce } from "lodash";

import { Select } from "components/Inputs";
import LoadBox from "components/LoadBox";

export default function Interaction({
  interactions,
  interactionsList,
  setFieldValue,
  drugs,
  searchDrugs,
  uniqueDrugList,
}) {
  const handleChange = (interactions) => {
    if (!isEmpty(interactions)) {
      interactions = interactions.map((item) => parseInt(item, 10));
    }

    const list = drugs.list
      .concat(interactionsList)
      .map((i) => {
        if (interactions.indexOf(parseInt(i.idDrug, 10)) !== -1) {
          return {
            ...i,
            idDrug: `${i.idDrug}`,
          };
        }

        return null;
      })
      .filter((i) => i != null);

    setFieldValue("interactions", interactions);
    setFieldValue("interactionsList", list);
  };

  const search = debounce((value) => {
    if (value.length < 3) return;
    // idSegment must be null to avoid not finding drug
    searchDrugs(null, { q: value });
  }, 800);

  if (!isEmpty(interactions)) {
    interactions = interactions.map((item) => `${item}`);
  }

  interactionsList = interactionsList || [];
  uniqueDrugList = uniqueDrugList || [];
  const normalizedList = drugs.list
    .concat(interactionsList)
    .concat(uniqueDrugList)
    .map((i) => ({
      ...i,
      idDrug: `${i.idDrug}`,
    }));

  return (
    <div style={{ display: "flex" }}>
      <Select
        id="interactions"
        mode="multiple"
        optionFilterProp="children"
        style={{ width: "100%" }}
        defaultValue={interactions || undefined}
        notFoundContent={drugs.isFetching ? <LoadBox /> : null}
        filterOption={false}
        onSearch={search}
        onChange={handleChange}
        placeholder="Digite para pesquisar mais medicamentos"
      >
        {uniqBy(normalizedList, "idDrug").map(({ idDrug, name }) => (
          <Select.Option key={`${idDrug}`} value={`${idDrug}`}>
            {name}
          </Select.Option>
        ))}
      </Select>
      {drugs.isFetching && (
        <div style={{ width: "50px" }}>
          {" "}
          <LoadBox />
        </div>
      )}
    </div>
  );
}
