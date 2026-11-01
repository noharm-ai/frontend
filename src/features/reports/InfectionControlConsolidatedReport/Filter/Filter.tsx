import AdvancedFilter from "components/AdvancedFilter";

import { MainFilters } from "./MainFilters";
import { SecondaryFilters } from "./SecondaryFilters";
import { IFilterValues } from "../infectionControlReportTypes";

interface FilterProps {
  onSearch: (filters: IFilterValues) => void;
  loading: boolean;
  initialValues: IFilterValues;
}

/** The report filters: period, segment and department, plus AWaRe, substance and reviewer. */
export function Filter({ onSearch, loading, initialValues }: FilterProps) {
  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      secondaryFilters={<SecondaryFilters />}
      onSearch={onSearch}
      loading={loading}
      onChangeValues={() => {}}
      skipFilterList={["dateRange", "segment", "department"]}
      memoryType=""
    />
  );
}
