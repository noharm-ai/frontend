import React from "react";

import { Row } from "components/Grid";
import { FILTER_ITEMS } from "./FilterItems";

export default function SecondaryFilters({ config }) {
  return (
    <Row gutter={[24, 24]}>
      {config.secondaryFilters.map((key) => {
        const FilterComponent = FILTER_ITEMS[key];
        return <FilterComponent key={key} source="secondary" />;
      })}
    </Row>
  );
}
