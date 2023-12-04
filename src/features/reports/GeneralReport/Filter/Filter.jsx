import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { FloatButton } from "antd";
import { MenuOutlined, ReloadOutlined } from "@ant-design/icons";

import notification from "components/notification";
import { FloatButtonGroup } from "components/FloatButton";
import AdvancedFilter from "components/AdvancedFilter";
import {
  fetchPrescriptions,
  reset,
  setFilteredStatus,
  setFilteredResult,
  setFilters,
} from "../GeneralReportSlice";
import { getReportData } from "../transformers";
import MainFilters from "./MainFilters";
import security from "services/security";

export default function Filter() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.reportsArea.general.status) === "loading";
  const currentFilters = useSelector(
    (state) => state.reportsArea.general.filters
  );
  const datasource = useSelector((state) => state.reportsArea.general.list);
  const roles = useSelector((state) => state.user.account.roles);
  const sec = security(roles);

  const cleanCache = () => {
    dispatch(fetchPrescriptions({ clearCache: true })).then((response) => {
      if (response.error) {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      } else {
        notification.success({
          message: "Cache limpo com sucesso!",
        });
        search(currentFilters, response.payload.cacheData);
      }
    });
  };

  const initialValues = {
    dateRange: [dayjs().startOf("month"), dayjs().subtract(1, "day")],
    responsibleList: [],
    departmentList: [],
  };

  useEffect(() => {
    dispatch(fetchPrescriptions()).then((response) => {
      if (response.error) {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      } else {
        search(initialValues, response.payload.cacheData);
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  const search = (params, forceDs) => {
    dispatch(setFilteredStatus("loading"));
    dispatch(setFilters(params));
    const reportData = getReportData(forceDs || datasource, params);
    dispatch(setFilteredResult(reportData));

    setTimeout(() => {
      dispatch(setFilteredStatus("succeeded"));
    }, 500);
  };

  return (
    <>
      <AdvancedFilter
        initialValues={initialValues}
        mainFilters={<MainFilters />}
        onSearch={search}
        loading={isFetching}
        skipFilterList={["dateRange"]}
      />
      {!isFetching && (
        <FloatButtonGroup
          trigger="click"
          type="primary"
          icon={<MenuOutlined />}
          tooltip="Menu"
          style={{ bottom: 25 }}
        >
          {sec.isAdmin() && (
            <FloatButton
              icon={<ReloadOutlined />}
              onClick={() => cleanCache()}
              tooltip="Limpar Cache"
            />
          )}
        </FloatButtonGroup>
      )}
      <FloatButton.BackTop
        style={{ right: 80, bottom: 25 }}
        tooltip="Voltar ao topo"
      />
    </>
  );
}
