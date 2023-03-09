import "styled-components/macro";
import React from "react";

import AdvancedFilter from "components/AdvancedFilter";

import MainFilters from "./MainFilters";

export default function Filter({ segments, hospitals, isFetching, fetchList }) {
  const initialValues = {
    idSegment: 1,
    idHospital: 1,
  };

  const search = (params) => {
    fetchList(params.idSegment, params.idHospital);
  };

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters segments={segments} hospitals={hospitals} />}
      onSearch={search}
      loading={isFetching}
      skipFilterList={["idSegment", "idHospital"]}
    />
  );
}
