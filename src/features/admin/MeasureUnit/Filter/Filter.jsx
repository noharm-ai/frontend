import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";

import { fetchMeasureUnits, reset } from "../MeasureUnitSlice";
import MainFilters from "./MainFilters";

export default function Filter() {
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.admin.frequency.status) === "loading";

  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    hasMeasureUnitNh: null,
  };

  useEffect(() => {
    dispatch(fetchMeasureUnits({ ...initialValues })).then((response) => {
      if (response.error) {
        notification.error(errorMessage);
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params) => {
    dispatch(fetchMeasureUnits(params)).then((response) => {
      if (response.error) {
        notification.error(errorMessage);
      }
    });
  };

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      onSearch={search}
      loading={isFetching}
      skipFilterList={["hasMeasureUnitNh"]}
    />
  );
}
