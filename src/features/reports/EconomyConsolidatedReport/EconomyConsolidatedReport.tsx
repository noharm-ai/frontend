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
import ChartEconomyDay from "./Charts/ChartEconomyDay";
import ChartEconomyType from "./Charts/ChartEconomyType";
// @ts-expect-error missing types
import { NoHarmLogoHorizontal as Brand } from "assets/NoHarmLogoHorizontal";
import {
  fetchReportData,
  setHelpModal,
} from "./EconomyConsolidatedReportSlice";
import Filter from "./Filter/Filter";
import { SummaryCards } from "./EconomyConsolidatedReport.style";
import { describeFilters } from "./options";
import DefaultModal from "components/Modal";
import { HelpModal } from "./Help/Help";
import { FloatButtonGroup } from "components/FloatButton";
import {
  onBeforePrint,
  onAfterPrint,
  filtersToDescription,
} from "src/utils/report";
import { formatCurrency } from "utils/number";
import notification from "components/notification";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";
import { trackReport, TrackedReport } from "src/utils/tracker";

export default function EconomyConsolidatedReport() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const printRef = useRef(null);
  const reportData = useSelector(
    (state: any) => state.reportsArea.economyConsolidated.filtered.result,
  );
  const status = useSelector(
    (state: any) => state.reportsArea.economyConsolidated.filtered.status,
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
    economy_type: "",
    economy_value_type: "p",
    status: ["a"],
    responsible: [],
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
    economy_type: {
      label: "Tipo economia",
      type: "list",
    },
    economy_value_type: {
      label: "Valor economia/dia",
      type: "text",
    },
    status: {
      label: "Desfecho",
      type: "list",
    },
    responsible: {
      label: "Responsável",
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
      economy_type:
        params.economy_type === "" || params.economy_type == null
          ? []
          : [params.economy_type],
      economy_value_type: params.economy_value_type || null,
      status: params.status,
      responsible: params.responsible,
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
    trackReport(TrackedReport.ECONOMY);
    navigate("/relatorios/economia");
  };

  const totals = reportData?.totals || {};
  const hasTotals = Object.keys(totals).length > 0;

  const currency = (value: any) =>
    hasTotals && value != null ? `R$ ${formatCurrency(value)}` : "-";

  const integer = (value: any) =>
    hasTotals && value != null ? value.toLocaleString() : "-";

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Relatório: Farmacoeconomia Anual
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
            Métricas consolidadas de economia gerada por intervenções.
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
              Este relatório consolida a <strong>Farmacoeconomia</strong> para
              análises de longo prazo, com atualização mensal (todo dia 1º).{" "}
              <br />
              *Para detalhes individuais, utilize o{" "}
              <strong>Relatório de Farmacoeconomia</strong>.<br />
              <Button
                type="link"
                style={{ padding: 0 }}
                onClick={() => openMonthlyReport()}
              >
                Acessar Relatório de Farmacoeconomia
              </Button>
            </>
          }
          showIcon
        />

        <div ref={printRef}>
          <ReportHeader className="report-header">
            <h1>Relatório: Farmacoeconomia Anual</h1>
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
            </SectionHeader>
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <SummaryCards>
                  <Spin spinning={isLoading}>
                    <StatsCard className="stats-card blue">
                      <div className="stats-title">Economia Total</div>
                      <div className="stats-value">
                        {currency(totals.total_economy)}
                      </div>
                    </StatsCard>
                  </Spin>
                  <Spin spinning={isLoading}>
                    <StatsCard className="stats-card green">
                      <div className="stats-title">
                        Intervenções com Economia
                      </div>
                      <div className="stats-value">
                        {integer(totals.total_interventions)}
                      </div>
                    </StatsCard>
                  </Spin>
                </SummaryCards>
              </Col>
              <Col xs={24} lg={12}>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <div
                      style={{
                        textAlign: "center",
                        fontWeight: 500,
                        fontSize: "16px",
                      }}
                    >
                      Economia por Tipo
                    </div>
                    <ChartEconomyType
                      reportData={reportData}
                      isLoading={isLoading}
                    />
                  </ChartCard>
                </Spin>
              </Col>
            </Row>
            <div className="page-break"></div>
            <SectionHeader>
              <h2>Economia</h2>
              <div>Economia gerada por período, separada por tipo</div>
            </SectionHeader>
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <ChartEconomyDay
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
