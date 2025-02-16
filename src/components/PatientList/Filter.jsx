import React, { useEffect } from "react";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import LoadBox from "components/LoadBox";
import AdvancedFilter from "components/AdvancedFilter";

import MainFilters from "./filters/MainFilters";
import SecondaryFilters from "./filters/SecondaryFilters";

export default function Filter({ error, isFetching, segments, fetchList }) {
  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    idSegment: !isEmpty(segments.list) ? 1 : null,
    idDepartment: [],
    nextAppointmentStartDate: null,
    nextAppointmentEndDate: null,
    scheduledBy: [],
    attendedBy: [],
    appointment: null,
  };

  useEffect(() => {
    fetchList(initialValues);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]); // eslint-disable-line

  const search = (params) => {
    fetchList(params);
  };

  if (segments.isFetching) {
    return <LoadBox />;
  }

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters segments={segments} />}
      secondaryFilters={<SecondaryFilters />}
      onSearch={search}
      loading={isFetching || segments.isFetching}
      skipFilterList={[
        "idSegment",
        "idDepartment",
        "nextAppointmentStartDate",
        "nextAppointmentEndDate",
      ]}
    />
  );
}
