import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";

import { fetchGlobalExams, reset } from "../GlobalExamSlice";

import MainFilters from "./MainFilters";

export default function Filter() {
  const dispatch = useAppDispatch();
  const isFetching =
    useAppSelector((state) => state.admin.globalExam.status) === "loading";

  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    active: undefined as boolean | undefined,
    term: "",
  };

  useEffect(() => {
    dispatch(fetchGlobalExams({ ...initialValues })).then((response: any) => {
      if (response.error) {
        notification.error(errorMessage);
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params: any) => {
    dispatch(fetchGlobalExams(params)).then((response: any) => {
      if (response.error) {
        notification.error(errorMessage);
      }
    });
  };

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      secondaryFilters={null}
      onSearch={search}
      onChangeValues={null}
      loading={isFetching}
      skipFilterList={["active"]}
      skipMemoryList={{}}
      memoryType={null}
    />
  );
}
