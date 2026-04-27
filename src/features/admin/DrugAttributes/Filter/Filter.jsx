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

export default function Filter({ limit, config }) {
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
    hasInconsistency: null,
    hasMissingConversion: null,
    hasAISubstance: null,
    missingAttributes: null,
    term: null,
    substance: null,
    idSegmentList: [],
    attributeList: [],
    sourceList: [],
    aiAccuracyRange: null,
    substanceList: [],
    tpSubstanceList: "in",
    tpAttributeList: "in",
    minDrugCount: null,
    hasSubstanceMaxDoseWeightAdult: null,
    hasSubstanceMaxDoseWeightPediatric: null,
    substanceStatus: null,
  };

  useEffect(() => {
    dispatch(
      fetchDrugAttributes({
        ...initialValues,
        ...config.apiParams,
        limit,
        offset: 0,
      })
    ).then((response) => {
      if (response.error) {
        notification.error(errorMessage);
      }
    });

    return () => {
      dispatch(reset());
    };
  }, [config]); //eslint-disable-line

  const search = (params) => {
    dispatch(setCurrentPage(1));
    dispatch(setFilters(params));
    dispatch(
      fetchDrugAttributes({ ...params, ...config.apiParams, limit, offset: 0 })
    ).then((response) => {
      if (response.error) {
        notification.error(errorMessage);
      }
    });
  };

  return (
    <AdvancedFilter
      key={config.pageTitle}
      initialValues={initialValues}
      mainFilters={<MainFilters config={config} />}
      secondaryFilters={<SecondaryFilters config={config} />}
      onSearch={search}
      loading={isFetching}
      skipFilterList={[
        "hasPriceConversion",
        "hasSubstance",
        "hasDefaultUnit",
        "hasPriceUnit",
        "idSegmentList",
      ]}
    />
  );
}
