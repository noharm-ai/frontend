import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { FloatButton, Spin } from "antd";
import {
  MenuOutlined,
  PrinterOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
  HistoryOutlined,
  SyncOutlined,
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
} from "../PrescriptionReportSlice";
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

export default function Filter({ printRef }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.reportsArea.prescription.status) === "loading";
  const currentFilters = useSelector(
    (state) => state.reportsArea.prescription.filters,
  );
  const datasource = useSelector(
    (state) => state.reportsArea.prescription.list,
  );
  const reportDate = useSelector(
    (state) => state.reportsArea.prescription.date,
  );
  const reportUpdatedAt = useSelector(
    (state) => state.reportsArea.prescription.updatedAt,
  );
  const userId = useSelector((state) => state.user.account.userId);
  const activeReport = useSelector(
    (state) => state.reportsArea.prescription.activeReport,
  );
  const historyModalOpen = useSelector(
    (state) => state.reportsArea.prescription.historyModal,
  );
  const availableReports = useSelector(
    (state) => state.reportsArea.prescription.availableReports,
  );
  const [exporting, setExporting] = useState(false);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onBeforeGetContent: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });
  const memoryFilterType = `prescription_report_${userId}`;
  const initialValues = {
    dateRange: [
      dayjs(reportDate).subtract(1, "day").startOf("month"),
      dayjs(reportDate).subtract(1, "day"),
    ],
    responsibleList: [],
    departmentList: [],
    segmentList: [],
    weekDays: false,
    showDiets: false,
    minScore: null,
    maxScore: null,
    daysOffList: [],
    tagList: [],
    timeRange: [null, null],
    removePrescriptionAtDischargeDate: "do_not_remove",
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
            />
          </>
        )}
      </Spin>
      {!isFetching && (
        <FloatButtonGroup
          trigger="click"
          type="primary"
          icon={<MenuOutlined />}
          tooltip={{ title: "Menu", placement: "left" }}
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
            tooltip={{ title: "Exportar CSV", placement: "left" }}
          />
          <FloatButton
            icon={<HistoryOutlined />}
            onClick={() => dispatch(setHistoryModal(true))}
            tooltip={{ title: "Histórico", placement: "left" }}
          />
          <FloatButton
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            tooltip={{ title: "Imprimir", placement: "left" }}
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
