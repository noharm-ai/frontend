import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";
import {
  fetchRegulationList,
  setFilters,
  setCurrentPage,
  reset,
} from "../PrioritizationSlice";
import MainFilters from "./MainFilters";
import SecondaryFilters from "./SecondaryFilters";

export default function Filter({ limit }) {
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.regulation.prioritization.status) ===
    "loading";
  const order = useSelector((state) => state.regulation.prioritization.order);

  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: null,
    typeType: null,
    idDepartmentList: [],
    riskList: [],
    typeList: [],
    stageList: [],
    idPatientList: [],
  };

  useEffect(() => {
    dispatch(setFilters(initialValues));
    dispatch(
      fetchRegulationList({ ...initialValues, limit, offset: 0, order })
    ).then((response) => {
      if (response.error) {
        notification.error(errorMessage);
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params) => {
    dispatch(setCurrentPage(1));
    dispatch(setFilters(params));
    dispatch(fetchRegulationList({ ...params, limit, offset: 0, order })).then(
      (response) => {
        if (response.error) {
          notification.error(errorMessage);
        }
      }
    );
  };

  const onChangeFilter = (values) => {
    dispatch(setFilters(values));
  };

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      secondaryFilters={<SecondaryFilters />}
      onSearch={search}
      onChangeValues={onChangeFilter}
      loading={isFetching}
      skipFilterList={["idDepartmentList", "stageList", "startDate", "endDate"]}
    />
  );
}
