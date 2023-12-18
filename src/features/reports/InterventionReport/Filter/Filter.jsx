import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { FloatButton } from "antd";
import {
  MenuOutlined,
  ReloadOutlined,
  PrinterOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";

import { FloatButtonGroup } from "components/FloatButton";
import AdvancedFilter from "components/AdvancedFilter";
import {
  fetchReportData,
  reset,
  setFilteredStatus,
  setFilteredResult,
  setFilters,
  setHelpModal,
} from "../InterventionReportSlice";
import { getReportData, filterAndExportCSV } from "../transformers";
import MainFilters from "./MainFilters";
import SecondaryFilters from "./SecondaryFilters";
import security from "services/security";
import { onBeforePrint, onAfterPrint } from "utils/report";
import useFetchReport from "hooks/useFetchReport";

export default function Filter({ printRef }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.reportsArea.intervention.status) === "loading";
  const currentFilters = useSelector(
    (state) => state.reportsArea.intervention.filters
  );
  const datasource = useSelector(
    (state) => state.reportsArea.intervention.list
  );
  const roles = useSelector((state) => state.user.account.roles);
  const userId = useSelector((state) => state.user.account.userId);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });
  const sec = security(roles);
  const memoryFilterType = `intervention_report_${userId}`;
  const initialValues = {
    dateRange: [dayjs().startOf("month"), dayjs().subtract(1, "day")],
    responsibleList: [],
    departmentList: [],
    segmentList: [],
    drugList: [],
    reasonList: [],
    statusList: [],
    weekDays: false,
    interventionType: "",
    cost: "",
    prescriptionError: "",
  };

  const fetchTools = useFetchReport({
    action: fetchReportData,
    reset,
    onAfterFetch: (data) => {
      search(initialValues, data);
    },
    onAfterClearCache: (data) => {
      search(currentFilters);
    },
  });

  const cleanCache = () => {
    fetchTools.clearCache();
  };

  const exportCSV = () => {
    filterAndExportCSV(datasource, currentFilters, t);
  };

  const showHelp = () => {
    dispatch(setHelpModal(true));
  };

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
    <React.Fragment>
      <AdvancedFilter
        initialValues={initialValues}
        mainFilters={<MainFilters />}
        secondaryFilters={<SecondaryFilters />}
        onSearch={search}
        loading={isFetching}
        skipFilterList={["dateRange", "segmentList", "departmentList"]}
        memoryType={memoryFilterType}
        skipMemoryList={{ dateRange: "daterange" }}
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
          <FloatButton
            icon={<QuestionCircleOutlined />}
            onClick={showHelp}
            tooltip="Informações sobre este relatório"
          />
          <FloatButton
            icon={<DownloadOutlined />}
            onClick={exportCSV}
            tooltip="Exportar CSV"
          />
          <FloatButton
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            tooltip="Imprimir"
          />
        </FloatButtonGroup>
      )}
      <FloatButton.BackTop
        style={{ right: 80, bottom: 25 }}
        tooltip="Voltar ao topo"
      />
    </React.Fragment>
  );
}
