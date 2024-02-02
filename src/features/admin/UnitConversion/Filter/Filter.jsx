import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";

import {
  fetchConversionList,
  setFilteredList,
  setFilters,
  setCurrentPage,
  reset,
} from "../UnitConversionSlice";
import { filterConversionList, groupConversions } from "../transformer";

import MainFilters from "./MainFilters";

export default function Filter() {
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.admin.unitConversion.status) === "loading";
  const drugList = useSelector((state) => state.admin.unitConversion.list);

  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues = {
    hasConversion: null,
  };

  useEffect(() => {
    dispatch(fetchConversionList()).then((response) => {
      if (response.error) {
        notification.error(errorMessage);
      } else {
        dispatch(setFilteredList(groupConversions(response.payload.data.data)));
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params) => {
    dispatch(setCurrentPage(1));
    dispatch(setFilters(params));

    dispatch(
      setFilteredList(filterConversionList(groupConversions(drugList), params))
    );
  };

  return (
    <AdvancedFilter
      initialValues={initialValues}
      mainFilters={<MainFilters />}
      onSearch={search}
      loading={isFetching}
      skipFilterList={["hasConversion"]}
    />
  );
}
