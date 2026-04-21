import React from "react";

import { FILTER_ITEMS } from "./FilterItems";

export default function MainFilters({ config }) {
  return (
    <>
      {config.mainFilters.map((key) => {
        const FilterComponent = FILTER_ITEMS[key];
        return <FilterComponent key={key} source="main" />;
      })}
    </>
  );
}
