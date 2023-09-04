import React, { useEffect } from "react";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";

import MainFilters from "./MainFilters";

export default function Filter({
  error,
  isFetching,
  searchList,
  resetLocalFilters,
  segments,
}) {
  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    startDate: dayjs().subtract(15, "days").format("YYYY-MM-DD"),
    endDate: null,
    idSegment: null,
  };

  useEffect(() => {
    searchList({
      startDate: dayjs().subtract(15, "days").format("YYYY-MM-DD"),
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
      mainFilters={<MainFilters segments={segments} />}
      onSearch={search}
      loading={isFetching}
      skipFilterList={["startDate", "endDate"]}
    />
  );
}
