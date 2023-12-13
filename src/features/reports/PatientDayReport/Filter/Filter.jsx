import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { FloatButton, Alert } from "antd";
import {
  MenuOutlined,
  ReloadOutlined,
  PrinterOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";

import { FloatButtonGroup } from "components/FloatButton";
import AdvancedFilter from "components/AdvancedFilter";
import DefaultModal from "components/Modal";
import Button from "components/Button";
import {
  fetchReportData,
  reset,
  setFilteredStatus,
  setFilteredResult,
  setFilters,
} from "../PatientDayReportSlice";
import { getReportData, filterAndExportCSV } from "../transformers";
import MainFilters from "./MainFilters";
import SecondaryFilters from "./SecondaryFilters";
import security from "services/security";
import useFetchReport from "hooks/useFetchReport";
import { onBeforePrint, onAfterPrint } from "utils/report";

export default function Filter({ printRef }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.reportsArea.patientDay.status) === "loading";
  const currentFilters = useSelector(
    (state) => state.reportsArea.patientDay.filters
  );
  const datasource = useSelector((state) => state.reportsArea.patientDay.list);
  const updatedAt = useSelector(
    (state) => state.reportsArea.patientDay.updatedAt
  );
  const roles = useSelector((state) => state.user.account.roles);
  const userId = useSelector((state) => state.user.account.userId);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });
  const sec = security(roles);
  const memoryFilterType = `patient_day_report_${userId}`;
  const initialValues = {
    dateRange: [dayjs().startOf("month"), dayjs().subtract(1, "day")],
    responsibleList: [],
    departmentList: [],
    segmentList: [],
    weekDays: false,
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
    DefaultModal.info({
      title: "Informações",
      content: (
        <>
          <Alert
            message={`Atualizado em: ${dayjs(updatedAt).format(
              "DD/MM/YY HH:mm"
            )}`}
            type="info"
          />
          <p>
            Este relatório apresenta as métricas de avaliação de{" "}
            <strong>Pacientes por Dia</strong>.
          </p>
          <p>
            O período disponibilizado para consulta é:{" "}
            <strong>{dayjs().subtract(60, "day").format("DD/MM/YY")}</strong>{" "}
            até <strong>{dayjs().subtract(1, "day").format("DD/MM/YY")}</strong>
          </p>
          <p>
            Para informações mais detalhadas sobre este relatório, acesse a base
            de conhecimento através do botão abaixo:
            <Button
              type="default"
              icon={<ExportOutlined />}
              size="large"
              style={{ marginTop: "10px" }}
              block
            >
              Base de Conhecimento
            </Button>
          </p>
        </>
      ),
      icon: <QuestionCircleOutlined />,
      width: 500,
      okText: "Fechar",
      okButtonProps: { type: "default" },
      wrapClassName: "default-modal",
    });
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
        skipFilterList={["dateRange"]}
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
