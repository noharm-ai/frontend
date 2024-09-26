import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";

import MainFilters from "./MainFilters";
import SecondaryFilters from "./SecondaryFilters";

export default function Filter({
  error,
  isFetching,
  searchList,
  resetLocalFilters,
  segments,
}) {
  const { t } = useTranslation();
  const userId = useSelector((state) => state.user.account.userId);

  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    startDate: dayjs().subtract(15, "days").format("YYYY-MM-DD"),
    endDate: null,
    idSegment: null,
    idDrug: [],
    hasEconomy: "",
  };

  const memoryFilterType = `intervention_list_${userId}`;

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
      mainFilters={<MainFilters />}
      secondaryFilters={<SecondaryFilters segments={segments} />}
      onSearch={search}
      loading={isFetching}
      skipFilterList={[
        "startDate",
        "endDate",
        "idInterventionReasonList",
        "admissionNumber",
        "statusList",
      ]}
      memoryType={memoryFilterType}
      skipMemoryList={{ startDate: "startDate", endDate: "endDate" }}
    />
  );
}
