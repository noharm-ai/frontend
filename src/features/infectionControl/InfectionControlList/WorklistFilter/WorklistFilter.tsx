import { useAppDispatch, useAppSelector } from "src/store";
import AdvancedFilter from "components/AdvancedFilter";

import {
  EMPTY_FILTERS,
  IInfectionControlListFilters,
  setFilters,
} from "../../InfectionControlListSlice";
import { MainFilters } from "./MainFilters/MainFilters";
import { SecondaryFilters } from "./SecondaryFilters/SecondaryFilters";

/**
 * The worklist filter card, the same one the prescription prioritization
 * shows: segment, department and pending reason up front, the other filters
 * under "see more"
 */
export function WorklistFilter() {
  const dispatch = useAppDispatch();
  const { status, filters } = useAppSelector(
    (state) => state.infectionControlList,
  );

  return (
    <AdvancedFilter
      // the filters in use when the page opens again
      initialValues={filters}
      resetValues={EMPTY_FILTERS}
      mainFilters={<MainFilters />}
      secondaryFilters={<SecondaryFilters />}
      onSearch={(values: IInfectionControlListFilters) =>
        dispatch(setFilters({ ...EMPTY_FILTERS, ...values }))
      }
      onChangeValues={undefined}
      memoryType={undefined}
      loading={status === "loading"}
      skipFilterList={["idSegment", "idDepartment", "pendingTypes"]}
    />
  );
}
