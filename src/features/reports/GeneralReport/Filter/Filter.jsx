import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";
import {
  fetchPrescriptions,
  reset,
  setFilteredStatus,
  setFilteredResult,
} from "../GeneralReportSlice";
import { getReportData } from "../transformers";
import MainFilters from "./MainFilters";

export default function Filter() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.reportsArea.general.status) === "loading";
  const datasource = useSelector((state) => state.reportsArea.general.list);

  const initialValues = {
    dateRange: [dayjs().startOf("month"), dayjs()],
    responsibleList: [],
    departmentList: [],
  };

  useEffect(() => {
    dispatch(fetchPrescriptions()).then((response) => {
      if (response.error) {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      } else {
        search(initialValues, response.payload.data.data);
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params, forceDs) => {
    dispatch(setFilteredStatus("loading"));
    const reportData = getReportData(forceDs || datasource, params);

    dispatch(setFilteredResult(reportData));

    setTimeout(() => {
      dispatch(setFilteredStatus("succeeded"));
    }, 500);
  };

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      onSearch={search}
      loading={isFetching}
      skipFilterList={["dateRange"]}
    />
  );
}
