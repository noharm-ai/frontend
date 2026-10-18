import { useAppDispatch, useAppSelector } from "src/store";
import AdvancedFilter from "components/AdvancedFilter";

import {
  DEFAULT_FILTERS,
  IInfectionControlListFilters,
  setFilters,
} from "../../InfectionControlListSlice";
import { MainFilters } from "./MainFilters/MainFilters";
import { SecondaryFilters } from "./SecondaryFilters/SecondaryFilters";

/**
 * The worklist filter card, the same one the prescription prioritization
 * shows: status, department and admissions up front, the other filters
 * under "see more"
 */
export function WorklistFilter() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.infectionControlList.filters);

  return (
    <AdvancedFilter
      // the filters in use when the page opens again
      initialValues={filters}
      resetValues={DEFAULT_FILTERS}
      mainFilters={<MainFilters />}
      secondaryFilters={<SecondaryFilters />}
      onSearch={(values: IInfectionControlListFilters) =>
        dispatch(setFilters({ ...DEFAULT_FILTERS, ...values }))
      }
      onChangeValues={undefined}
      memoryType={undefined}
      // the list shows it is loading; the filters can change meanwhile, the
      // latest search wins
      loading={false}
      skipFilterList={["status", "idDepartment", "admissionNumbers"]}
    />
  );
}
