import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";

import { fetchTags, reset } from "../TagSlice";

import MainFilters from "./MainFilters";

export default function Filter() {
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.admin.tag.status) === "loading";

  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    active: null,
  };

  useEffect(() => {
    dispatch(fetchTags({ ...initialValues })).then((response) => {
      if (response.error) {
        notification.error(errorMessage);
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params) => {
    dispatch(fetchTags(params)).then((response) => {
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
      skipFilterList={["active"]}
    />
  );
}
