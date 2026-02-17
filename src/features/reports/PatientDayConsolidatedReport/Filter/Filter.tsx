import AdvancedFilter from "components/AdvancedFilter";
import MainFilters from "./MainFilters";
import SecondaryFilters from "./SecondaryFilters";

interface FilterProps {
  onSearch: (filters: any) => void;
  loading: boolean;
  initialValues: any;
}

export default function Filter({
  onSearch,
  loading,
  initialValues,
}: FilterProps) {
  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      secondaryFilters={<SecondaryFilters />}
      onSearch={onSearch}
      loading={loading}
      onChangeValues={() => {}}
      skipFilterList={[
        "dateRange",
        "segment",
        "id_department",
        "start_date",
        "end_date",
      ]}
      memoryType=""
    />
  );
}
