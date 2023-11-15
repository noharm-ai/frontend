import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";

import { fetchFrequencies, reset } from "../FrequencySlice";

import MainFilters from "./MainFilters";

export default function Filter({ limit }) {
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.admin.frequency.status) === "loading";

  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    hasDailyFrequency: null,
  };

  useEffect(() => {
    dispatch(fetchFrequencies({ ...initialValues })).then((response) => {
      if (response.error) {
        notification.error(errorMessage);
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params) => {
    dispatch(fetchFrequencies(params)).then((response) => {
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
      skipFilterList={["hasDailyFrequency"]}
    />
  );
}
