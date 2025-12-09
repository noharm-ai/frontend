import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";
import {
  fetchReport,
  fetchSummary,
  setFilters,
  setCurrentPage,
  reset,
} from "../IndicatorsPanelReportSlice";
import MainFilters from "./MainFilters";
import SecondaryFilters from "./SecondaryFilters";

interface IFilter {
  limit: number;
}

export default function Filter({ limit }: IFilter) {
  const dispatch = useAppDispatch();
  const isFetching =
    useAppSelector((state) => state.regulation.indicatorsPanelReport.status) ===
    "loading";
  const order = useAppSelector(
    (state) => state.regulation.indicatorsPanelReport.order
  );

  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    name: null,
    has_indicator: null,
    indicator: "HPV_VACCINE",
  };

  useEffect(() => {
    dispatch(setFilters(initialValues));
    dispatch(fetchReport({ ...initialValues, limit, offset: 0, order })).then(
      (response: any) => {
        if (response.error) {
          notification.error(errorMessage);
        }
      }
    );

    dispatch(fetchSummary({}));

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params: any) => {
    dispatch(setCurrentPage(1));
    dispatch(setFilters(params));
    dispatch(fetchReport({ ...params, limit, offset: 0, order })).then(
      (response: any) => {
        if (response.error) {
          notification.error(errorMessage);
        }
      }
    );
  };

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      secondaryFilters={<SecondaryFilters />}
      onSearch={search}
      onChangeValues={null}
      loading={isFetching}
      skipFilterList={["indicator", "has_indicator"]}
      memoryType={`regulation_indicators_panel`}
      skipMemoryList={{ startDate: "startDate", endDate: "endDate" }}
    />
  );
}
