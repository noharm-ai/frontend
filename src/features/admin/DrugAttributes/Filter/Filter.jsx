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
import SecondaryFilters from "./SecondaryFilters";

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
    hasPriceUnit: null,
    hasPrescription: true,
    term: null,
    idSegmentList: [],
  };

  useEffect(() => {
    dispatch(fetchDrugAttributes({ ...initialValues, limit, offset: 0 })).then(
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
    dispatch(fetchDrugAttributes({ ...params, limit, offset: 0 })).then(
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
      skipFilterList={[
        "hasPriceConversion",
        "hasSubstance",
        "hasDefaultUnit",
        "idSegmentList",
      ]}
    />
  );
}
