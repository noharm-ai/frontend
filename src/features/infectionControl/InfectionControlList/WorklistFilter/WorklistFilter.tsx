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
 * under "see more". Each user can save filters to apply them again
 */
export function WorklistFilter() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.infectionControlList.filters);
  const userId = useAppSelector((state: any) => state.user.account.userId);

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
      // the saved filters, of this user only
      memoryType={`infection_control_list_${userId}`}
      // the list shows it is loading; the filters can change meanwhile, the
      // latest search wins
      loading={false}
      skipFilterList={[
        "status",
        "idDepartment",
        "admissionNumbers",
        "antimicrobialsMatchAll",
        "closedDays",
      ]}
    />
  );
}
