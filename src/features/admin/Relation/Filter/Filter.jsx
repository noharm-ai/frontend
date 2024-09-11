import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";

import {
  fetchRelations,
  reset,
  setFilters,
  setCurrentPage,
} from "../RelationsSlice";

import MainFilters from "./MainFilters";
import SecondaryFilters from "./SecondaryFilters";

export default function Filter({ limit }) {
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.admin.relation.status) === "loading";

  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {};

  useEffect(() => {
    dispatch(fetchRelations({ ...initialValues, limit, offset: 0 })).then(
      (response) => {
        if (response.error) {
          notification.error(errorMessage);
        }
      }
    );

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params) => {
    dispatch(setCurrentPage(1));
    dispatch(setFilters(params));
    dispatch(fetchRelations({ ...params, limit, offset: 0 })).then(
      (response) => {
        if (response.error) {
          notification.error(errorMessage);
        }
      }
    );
  };

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      secondaryFilters={<SecondaryFilters />}
      onSearch={search}
      loading={isFetching}
      skipFilterList={["idOriginList", "idDestinationList"]}
    />
  );
}
