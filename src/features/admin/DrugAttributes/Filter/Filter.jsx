import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";

import {
  fetchDrugAttributes,
  setFilters,
  setCurrentPage,
  reset,
} from "../DrugAttributesSlice";

import MainFilters from "./MainFilters";

export default function Filter({ limit }) {
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.admin.drugAttributes.status) === "loading";

  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    hasPriceConversion: null,
    hasSubstance: null,
    hasDefaultUnit: null,
    term: null,
    idSegmentList: [],
  };

  useEffect(() => {
    dispatch(fetchDrugAttributes({ limit, offset: 0 })).catch(() => {
      notification.error(errorMessage);
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params) => {
    dispatch(setCurrentPage(1));
    dispatch(fetchDrugAttributes({ ...params, limit, offset: 0 }));
  };

  const onChangeValues = (params) => {
    dispatch(setFilters(params));
  };

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      onSearch={search}
      onChangeValues={onChangeValues}
      loading={isFetching}
      skipFilterList={[]}
    />
  );
}
