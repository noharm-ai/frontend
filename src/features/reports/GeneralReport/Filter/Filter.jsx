import React, { useEffect } from "react";
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

import notification from "components/notification";
import { FloatButtonGroup } from "components/FloatButton";
import AdvancedFilter from "components/AdvancedFilter";
import DefaultModal from "components/Modal";
import Button from "components/Button";
import {
  fetchPrescriptions,
  reset,
  setFilteredStatus,
  setFilteredResult,
  setFilters,
} from "../GeneralReportSlice";
import { getReportData, toCSV } from "../transformers";
import MainFilters from "./MainFilters";
import security from "services/security";

export default function Filter({ printRef }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.reportsArea.general.status) === "loading";
  const currentFilters = useSelector(
    (state) => state.reportsArea.general.filters
  );
  const datasource = useSelector((state) => state.reportsArea.general.list);
  const updatedAt = useSelector((state) => state.reportsArea.general.updatedAt);
  const roles = useSelector((state) => state.user.account.roles);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      const event = new CustomEvent("onbeforeprint");
      window.dispatchEvent(event);

      return new Promise((resolve) => setTimeout(resolve, 100));
    },
    onAfterPrint: () => {
      const event = new CustomEvent("onafterprint");
      window.dispatchEvent(event);
    },
  });
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

  const exportCSV = () => {
    const csv = toCSV(datasource, currentFilters);
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio.csv");
    document.body.appendChild(link);

    link.click();
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
    <React.Fragment>
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
