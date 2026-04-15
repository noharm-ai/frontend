import { useEffect } from "react";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import notification from "components/notification";
import LoadBox from "components/LoadBox";
import AdvancedFilter from "components/AdvancedFilter";

import { fetchPatientList } from "../OutpatientPrioritizationSlice";
import type { OutpatientFilters } from "../OutpatientPrioritizationSlice";
import { MainFilters } from "./MainFilters";
import { SecondaryFilters } from "./SecondaryFilters";

export function Filter() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const status = useSelector((state: any) => state.outpatient.status);
  const error = useSelector((state: any) => state.outpatient.error);
  const segments = useSelector((state: any) => state.segments);

  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };

  const initialValues: OutpatientFilters = {
    idSegment: !isEmpty(segments.list) ? 1 : null,
    idDepartment: [],
    nextAppointmentStartDate: null,
    nextAppointmentEndDate: null,
    scheduledBy: [],
    attendedBy: [],
    appointment: null,
  };

  useEffect(() => {
    dispatch(fetchPatientList(initialValues) as any);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]); // eslint-disable-line

  const search = (params: OutpatientFilters) => {
    dispatch(fetchPatientList(params) as any);
  };

  if (segments.isFetching) {
    return <LoadBox />;
  }

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      secondaryFilters={<SecondaryFilters />}
      onSearch={search}
      onChangeValues={undefined as any}
      memoryType={null as any}
      loading={status === "loading" || segments.isFetching}
      skipFilterList={[
        "idSegment",
        "idDepartment",
        "nextAppointmentStartDate",
        "nextAppointmentEndDate",
      ]}
    />
  );
}
