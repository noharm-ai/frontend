import React, { useEffect } from "react";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import moment from "moment";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";

import MainFilters from "./MainFilters";

export default function Filter({
  error,
  isFetching,
  searchList,
  resetLocalFilters,
}) {
  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    startDate: moment().subtract(15, "days").format("YYYY-MM-DD"),
    endDate: null,
  };

  useEffect(() => {
    searchList({
      startDate: moment().subtract(15, "days").format("YYYY-MM-DD"),
    });
  }, [searchList]);

  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]); // eslint-disable-line

  const search = (params) => {
    resetLocalFilters();
    searchList(params);
  };

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      onSearch={search}
      loading={isFetching}
      skipFilterList={["startDate", "endDate"]}
    />
  );
}
