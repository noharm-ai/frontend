import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import AdvancedFilter from "components/AdvancedFilter";
import notification from "components/notification";
import MainFilters from "./MainFilters";
import { listExams, reset } from "../ExamSlice";

export default function Filter() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.admin.exam.exams.status) === "loading";
  const initialValues = {
    idSegment: 1,
  };

  useEffect(() => {
    dispatch(listExams({ ...initialValues })).then((response) => {
      if (response.error) {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params) => {
    dispatch(listExams(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      }
    });
  };

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      onSearch={search}
      loading={isFetching}
      skipFilterList={["idSegment"]}
    />
  );
}
