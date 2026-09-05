import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Row, Col, Space, Spin, FloatButton, Alert } from "antd";
import {
  UnorderedListOutlined,
  QuestionOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { PageHeader } from "styles/PageHeader.style";
import {
  StatsCard,
  ChartCard,
  SectionHeader,
  ReportContainer,
  ReportHeader,
  ReportFilterContainer,
} from "styles/Report.style";
import { ChartInterventionDay } from "./Charts/ChartInterventionDay";
import { ChartInterventionStatus } from "./Charts/ChartInterventionStatus";
// @ts-expect-error missing types
import { NoHarmLogoHorizontal as Brand } from "assets/NoHarmLogoHorizontal";
import {
  fetchReportData,
  setHelpModal,
} from "./InterventionConsolidatedReportSlice";
import { Filter } from "./Filter/Filter";
import {
  describeFilters,
  getAccountable,
  getAcceptedPercentage,
} from "./options";
import DefaultModal from "components/Modal";
import { HelpModal } from "./Help/Help";
import { FloatButtonGroup } from "components/FloatButton";
import {
  onBeforePrint,
  onAfterPrint,
  filtersToDescription,
} from "src/utils/report";
import notification from "components/notification";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";
import { trackReport, TrackedReport } from "src/utils/tracker";

export function InterventionConsolidatedReport() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const printRef = useRef(null);
  const reportData = useSelector(
    (state: any) => state.reportsArea.interventionConsolidated.filtered.result,
  );
  const status = useSelector(
    (state: any) => state.reportsArea.interventionConsolidated.filtered.status,
  );
  const [filters, setFilters] = useState<any>({});
  const isLoading = status === "loading";
  const hideNames = FeatureService.has(Feature.HIDE_NAMES);

  const initialValues = {
    segment: [],
    department: [],
    start_date: dayjs().startOf("year").format("YYYY-MM-DD"),
    end_date: dayjs().endOf("year").format("YYYY-MM-DD"),
    dateRange: [dayjs().startOf("year"), dayjs().endOf("year")],
    status: [],
    responsible: [],
    prescriber: [],
    insurance: [],
    reason: [],
  };

  const filtersConfig = {
    start_date: {
      label: "Data Inicial",
      type: "date",
    },
    end_date: {
      label: "Data Final",
      type: "date",
    },
    segment: {
      label: "Segmento",
      type: "list",
    },
    department: {
      label: "Setor",
      type: "list",
    },
    status: {
      label: "Desfecho",
      type: "list",
    },
    reason: {
      label: "Motivo",
      type: "list",
    },
    insurance: {
      label: "Convênio",
      type: "list",
    },
    responsible: {
      label: "Responsável",
      type: "list",
      mask: hideNames,
    },
    prescriber: {
      label: "Prescritor",
      type: "list",
      mask: hideNames,
    },
  };

  const onSearch = (params: any) => {
    if (
      params.dateRange &&
      params.dateRange[0] &&
      params.dateRange[1] &&
      params.dateRange[0].year() !== params.dateRange[1].year()
    ) {
      DefaultModal.error({
        title: "Período inválido",
        content: "Por favor, selecione datas dentro do mesmo ano.",
      });
      return;
    }

    const apiParams = {
      year: params.dateRange[0].year(),
      segment: params.segment,
      department: params.department,
      start_date: params.dateRange[0]
        ? params.dateRange[0].format("YYYY-MM-DD")
        : null,
      end_date: params.dateRange[1]
        ? params.dateRange[1].format("YYYY-MM-DD")
        : null,
      status: params.status,
      responsible: params.responsible,
      prescriber: params.prescriber,
      insurance: params.insurance,
      reason: params.reason,
    };

    dispatch(fetchReportData(apiParams) as any).then((response: any) => {
      if (response.error) {
        notification.error({
          message: "Erro ao carregar dados",
          description:
            response.payload?.message || "Ocorreu um erro inesperado",
        });
      } else {
        const description = describeFilters(apiParams);
        delete description.year;
        setFilters(description);
      }
    });
  };

  useEffect(() => {
    onSearch(initialValues);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onBeforePrint: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });

  const openMonthlyReport = () => {
    trackReport(TrackedReport.INTERVENTIONS);
    navigate("/relatorios/intervencoes");
  };

  const totals = reportData?.totals || {};
  const hasTotals = Object.keys(totals).length > 0;

  const integer = (value: any) =>
    hasTotals && value != null ? value.toLocaleString() : "-";

  const statCard = (
    title: string,
    value: any,
    color: string,
    suffix: string = "",
  ) => (
    <Col xs={12}>
      <Spin spinning={isLoading}>
        <StatsCard className={color}>
          <div className="stats-title">{title}</div>
          <div className="stats-value">
            {integer(value)}
            {hasTotals ? suffix : ""}
          </div>
        </StatsCard>
      </Spin>
    </Col>
  );

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Relatório: Intervenções Anual
            <Tooltip title="Informações sobre este relatório">
              <Button
                type="primary"
                shape="circle"
                icon={<QuestionOutlined />}
                loading={status === "loading"}
                onClick={() => dispatch(setHelpModal(true))}
              />
            </Tooltip>
          </h1>
          <div className="page-header-legend">
            Métricas consolidadas de Intervenções.
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            type="default"
            icon={<UnorderedListOutlined />}
            onClick={() => navigate("/relatorios")}
          >
            Ver todos relatórios
          </Button>
        </div>
      </PageHeader>

      <ReportContainer>
        <Filter
          onSearch={onSearch}
          loading={isLoading}
          initialValues={initialValues}
        />

        <Alert
          title={<strong>Relatório Anual</strong>}
          description={
            <>
              Este relatório consolida as <strong>Intervenções</strong> para
              análises de longo prazo, com atualização mensal (todo dia 1º).{" "}
              <br />
              *Para detalhes individuais, utilize o{" "}
              <strong>Relatório de Intervenções</strong>.<br />
              <Button
                type="link"
                style={{ padding: 0 }}
                onClick={() => openMonthlyReport()}
              >
                Acessar Relatório de Intervenções
              </Button>
            </>
          }
          showIcon
        />

        <div ref={printRef}>
          <ReportHeader className="report-header">
            <h1>Relatório: Intervenções Anual</h1>
            <div className="brand">
              <Brand />
            </div>
          </ReportHeader>

          <ReportFilterContainer>
            <div
              className="report-filter-list"
              dangerouslySetInnerHTML={{
                __html: filtersToDescription(filters, filtersConfig),
              }}
            ></div>
          </ReportFilterContainer>

          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <SectionHeader>
              <h2>Resumo</h2>
              <div>Totais por situação e percentual de aceitação.</div>
            </SectionHeader>
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <ChartInterventionStatus
                      reportData={reportData}
                      isLoading={isLoading}
                    />
                  </ChartCard>
                </Spin>
              </Col>

              <Col xs={24} lg={12}>
                <Row gutter={[24, 24]}>
                  {statCard("Intervenções", totals.total_interventions, "blue")}
                  {statCard(
                    "Passíveis de Aceite",
                    getAccountable(totals),
                    "blue",
                  )}
                  {statCard("Não Aceitas", totals.total_not_accepted, "red")}
                  {statCard("Aceitas", totals.total_accepted, "green")}
                  {statCard("Pendentes", totals.total_pending, "yellow")}
                  {statCard(
                    "Aceitação",
                    getAcceptedPercentage(totals),
                    "green",
                    "%",
                  )}
                </Row>
              </Col>
            </Row>

            <div className="page-break"></div>
            <SectionHeader>
              <h2>Intervenções</h2>
              <div>Intervenções por período, separadas por desfecho</div>
            </SectionHeader>
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <ChartInterventionDay
                      reportData={reportData}
                      isLoading={isLoading}
                    />
                  </ChartCard>
                </Spin>
              </Col>
            </Row>
          </Space>
        </div>
      </ReportContainer>
      <HelpModal />
      {!isLoading && (
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
            onClick={() => dispatch(setHelpModal(true))}
            tooltip={{
              title: "Informações sobre este relatório",
              placement: "left",
            }}
          />

          <FloatButton
            icon={<PrinterOutlined />}
            onClick={() => handlePrint()}
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
    </>
  );
}
