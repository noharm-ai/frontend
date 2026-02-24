import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { FloatButton, Spin } from "antd";
import {
  MenuOutlined,
  PrinterOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
  HistoryOutlined,
  SyncOutlined,
  LineChartOutlined,
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
  setHistoryModal,
  setActiveReport,
} from "../PatientDayReportSlice";
import { getReportData, filterAndExportCSV } from "../transformers";
import MainFilters from "./MainFilters";
import SecondaryFilters from "./SecondaryFilters";
import useFetchReport from "hooks/useFetchReport";
import {
  onBeforePrint,
  onAfterPrint,
  decompressDatasource,
} from "utils/report";
import HistoryModal from "features/reports/components/HistoryModal/HistoryModal";
import HistoryAlert from "features/reports/components/HistoryAlert/HistoryAlert";
import { trackReport, TrackedReport } from "src/utils/tracker";

export default function Filter({ printRef }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isFetching =
    useSelector((state) => state.reportsArea.patientDay.status) === "loading";
  const currentFilters = useSelector(
    (state) => state.reportsArea.patientDay.filters,
  );
  const datasource = useSelector((state) => state.reportsArea.patientDay.list);
  const reportDate = useSelector((state) => state.reportsArea.patientDay.date);
  const reportUpdatedAt = useSelector(
    (state) => state.reportsArea.patientDay.updatedAt,
  );
  const userId = useSelector((state) => state.user.account.userId);
  const activeReport = useSelector(
    (state) => state.reportsArea.patientDay.activeReport,
  );
  const historyModalOpen = useSelector(
    (state) => state.reportsArea.patientDay.historyModal,
  );
  const availableReports = useSelector(
    (state) => state.reportsArea.patientDay.availableReports,
  );
  const [exporting, setExporting] = useState(false);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onBeforeGetContent: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });
  const memoryFilterType = `patient_day_report_${userId}`;
  const initialValues = {
    dateRange: [
      dayjs(reportDate).subtract(1, "day").startOf("month"),
      dayjs(reportDate).subtract(1, "day"),
    ],
    responsibleList: [],
    departmentList: [],
    segmentList: [],
    weekDays: false,
    minScore: null,
    maxScore: null,
    daysOffList: [],
    tagList: [],
  };

  const reportManager = useFetchReport({
    action: fetchReportData,
    reset,
    onAfterFetch: (body, header) => {
      search(
        {
          ...initialValues,
          dateRange: [
            dayjs(header.date).subtract(1, "day").startOf("month"),
            dayjs(header.date).subtract(1, "day"),
          ],
        },
        body,
      );
    },
  });

  const exportCSV = async () => {
    if (exporting) return;

    setExporting(true);
    const ds = await decompressDatasource(datasource);
    await filterAndExportCSV(ds, currentFilters, t);

    setExporting(false);
  };

  const loadArchive = (filename) => {
    dispatch(setActiveReport(filename));
    reportManager.loadArchive(filename);
  };

  const showHelp = () => {
    dispatch(setHelpModal(true));
  };

  const search = async (params, forceDs) => {
    let ds = [];
    if (!forceDs) {
      ds = await decompressDatasource(datasource);
    }

    dispatch(setFilteredStatus("loading"));
    dispatch(setFilters(params));

    const reportData = getReportData(forceDs || ds, params);
    dispatch(setFilteredResult(reportData));

    setTimeout(() => {
      dispatch(setFilteredStatus("succeeded"));
    }, 500);
  };

  const openYearlyReport = () => {
    trackReport(TrackedReport.PATIENT_DAY_YEARLY);
    navigate("/relatorios/consolidado/pacientes-dia");
  };

  return (
    <React.Fragment>
      <Spin spinning={isFetching}>
        {!isFetching && (
          <>
            <AdvancedFilter
              initialValues={initialValues}
              mainFilters={<MainFilters />}
              secondaryFilters={<SecondaryFilters />}
              onSearch={search}
              loading={isFetching}
              skipFilterList={["dateRange"]}
              memoryType={memoryFilterType}
              skipMemoryList={{ dateRange: "daterange" }}
            />
            <HistoryAlert
              activeReport={activeReport}
              loadArchive={loadArchive}
              reportDate={reportUpdatedAt}
            />
            <HistoryModal
              availableReports={availableReports}
              loadArchive={loadArchive}
              open={historyModalOpen}
              setOpen={setHistoryModal}
              anualreportLink="/relatorios/consolidado/pacientes-dia"
              onOpenYearlyReport={openYearlyReport}
            />
          </>
        )}
      </Spin>
      {!isFetching && (
        <FloatButtonGroup
          trigger="click"
          type="primary"
          icon={<MenuOutlined />}
          tooltip={{
            title: "Menu",
            placement: "left",
          }}
          style={{ bottom: 25 }}
        >
          <FloatButton
            icon={<QuestionCircleOutlined />}
            onClick={showHelp}
            tooltip={{
              title: "Informações sobre este relatório",
              placement: "left",
            }}
          />
          <FloatButton
            icon={
              exporting ? <SyncOutlined spin={true} /> : <DownloadOutlined />
            }
            onClick={exportCSV}
            tooltip={{
              title: "Exportar CSV",
              placement: "left",
            }}
          />
          <FloatButton
            icon={<LineChartOutlined />}
            onClick={() => openYearlyReport()}
            tooltip={{
              title: "Abrir relatório anual",
              placement: "left",
            }}
          />
          <FloatButton
            icon={<HistoryOutlined />}
            onClick={() => dispatch(setHistoryModal(true))}
            tooltip={{
              title: "Histórico",
              placement: "left",
            }}
          />
          <FloatButton
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            tooltip={{
              title: "Imprimir",
              placement: "left",
            }}
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
