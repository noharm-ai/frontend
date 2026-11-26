import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";

import notification from "components/notification";
import AdvancedFilter from "components/AdvancedFilter";

import { fetchTags, reset, ITagFilterParams } from "../TagSlice";

import { MainFilters } from "./MainFilters";

export function Filter() {
  const dispatch = useAppDispatch();
  const isFetching =
    useAppSelector((state) => state.admin.tag.status) === "loading";

  const { t } = useTranslation();
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };
  const initialValues: ITagFilterParams = {
    active: null,
  };

  useEffect(() => {
    dispatch(fetchTags({ ...initialValues })).then((response: any) => {
      if (response.error) {
        notification.error(errorMessage);
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params: ITagFilterParams) => {
    dispatch(fetchTags(params)).then((response: any) => {
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
      memoryType={null}
    />
  );
}
