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
  const selectedInteractions = isEmpty(interactions)
    ? interactions
    : interactions.map((item) => `${item}`);
  const currentInteractionsList = interactionsList || [];
  const currentUniqueDrugList = uniqueDrugList || [];

  const handleChange = (interactions) => {
    if (!isEmpty(interactions)) {
      interactions = interactions.map((item) => parseInt(item, 10));
    }

    const list = drugs.list
      .concat(currentInteractionsList)
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

  const normalizedList = drugs.list
    .concat(currentInteractionsList)
    .concat(currentUniqueDrugList)
    .map((i) => ({
      ...i,
      idDrug: `${i.idDrug}`,
    }));

  return (
    <div style={{ display: "flex" }}>
      <Select
        id="interactions"
        mode="multiple"
        style={{ width: "100%" }}
        defaultValue={selectedInteractions || undefined}
        notFoundContent={drugs.isFetching ? <LoadBox /> : null}
        onChange={handleChange}
        placeholder="Digite para pesquisar mais medicamentos"
        showSearch={{
          optionFilterProp: ["children"],
          filterOption: false,
          onSearch: search,
          autoClearSearchValue: false,
        }}
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
