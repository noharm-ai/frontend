import dayjs from "dayjs";

import AdvancedFilter from "components/AdvancedFilter";
import MainFilters from "./MainFilters";
import SecondaryFilters from "./SecondaryFilters";

interface FilterProps {
  onSearch: (filters: any) => void;
  loading: boolean;
}

export default function Filter({ onSearch, loading }: FilterProps) {
  const initialValues = {
    segment: [],
    id_department: [],
    start_date: dayjs().startOf("year").format("YYYY-MM-DD"),
    end_date: dayjs().endOf("year").format("YYYY-MM-DD"),
    global_score_start: null,
    global_score_end: null,
    dateRange: [dayjs().startOf("year"), dayjs().endOf("year")],
  };

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
