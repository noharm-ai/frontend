import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";
import { getErrorMessage } from "utils/errorHandler";

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
  const filters = useSelector((state) => state.admin.unitConversion.filters);

  const { t } = useTranslation();
  const initialValues = {
    conversionType: null,
    showPrediction: true,
    minDrugCount: null,
    tags: [],
  };

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params) => {
    if (filters.showPrediction !== params.showPrediction) {
      dispatch(fetchConversionList(params)).then((response) => {
        if (response.error) {
          notification.error({ message: getErrorMessage(response, t) });
        } else {
          dispatch(setCurrentPage(1));
          dispatch(setFilters(params));
          dispatch(
            setFilteredList(
              filterConversionList(
                groupConversions(response.payload.data.data),
                params
              )
            )
          );
        }
      });
    } else {
      dispatch(setCurrentPage(1));
      dispatch(setFilters(params));

      dispatch(
        setFilteredList(
          filterConversionList(groupConversions(drugList), params)
        )
      );
    }
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
