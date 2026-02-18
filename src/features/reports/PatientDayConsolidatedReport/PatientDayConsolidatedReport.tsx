import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Row, Col, Space, Spin } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";

import Button from "components/Button";
import { PageHeader } from "styles/PageHeader.style";
import {
  StatsCard,
  ChartCard,
  SectionHeader,
  ReportContainer,
  ReportHeader,
} from "styles/Report.style";
import ChartPrescriptionDay from "./Charts/ChartPrescriptionDay";
// @ts-expect-error missing types
import { NoHarmLogoHorizontal as Brand } from "assets/NoHarmLogoHorizontal";
import { fetchReportData } from "./PatientDayConsolidatedReportSlice";
import Filter from "./Filter/Filter";
import { FeatureService } from "services/FeatureService";
import DefaultModal from "components/Modal";

export default function PatientDayConsolidatedReport() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reportData = useSelector(
    (state: any) => state.reportsArea.patientDayConsolidated.filtered.result,
  );
  const status = useSelector(
    (state: any) => state.reportsArea.patientDayConsolidated.filtered.status,
  );
  const isLoading = status === "loading";

  const initialValues = {
    segment: [],
    id_department: [],
    start_date: dayjs().startOf("year").format("YYYY-MM-DD"),
    end_date: dayjs().endOf("year").format("YYYY-MM-DD"),
    global_score_start: null,
    global_score_end: null,
    dateRange: [dayjs().startOf("year"), dayjs().endOf("year")],
    weekdays_only: false,
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

    // Clean up params before sending
    const apiParams = {
      year: params.dateRange[0].year(),
      ...params,
      start_date: params.dateRange[0]
        ? params.dateRange[0].format("YYYY-MM-DD")
        : null,
      end_date: params.dateRange[1]
        ? params.dateRange[1].format("YYYY-MM-DD")
        : null,
    };
    dispatch(fetchReportData(apiParams) as any);
  };

  useEffect(() => {
    onSearch(initialValues);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const percentualPrescriptions = reportData?.totals
    ?.total_prescriptions_checked
    ? Math.round(
        (reportData?.totals?.total_prescriptions_checked /
          reportData?.totals?.total_prescriptions) *
          100,
      )
    : 0;

  const percentualItens = reportData?.totals?.total_itens_checked
    ? Math.round(
        (reportData?.totals?.total_itens_checked /
          reportData?.totals?.total_itens) *
          100,
      )
    : 0;

  const percentualPatients = reportData?.totals?.total_patients_checked
    ? Math.round(
        (reportData?.totals?.total_patients_checked /
          reportData?.totals?.total_patients) *
          100,
      )
    : 0;

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">
            Relatório: Pacientes-Dia Consolidado
          </h1>
          <div className="page-header-legend">
            Métricas consolidadas de Pacientes-Dia.
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

        <div>
          <ReportHeader className="report-header">
            <h1>Relatório: Pacientes-Dia Consolidado</h1>
            <div className="brand">
              <Brand />
            </div>
          </ReportHeader>

          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <SectionHeader>
              <h2>Resumo</h2>
            </SectionHeader>
            <Row gutter={[24, 24]}>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={`blue `}>
                    <div className="stats-title">Total de Pacientes-Dia</div>
                    <div className="stats-value">
                      {reportData?.totals?.total_prescriptions?.toLocaleString() ||
                        "-"}
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={`green `}>
                    <div className="stats-title">Pacientes-Dia Checados</div>
                    <div className="stats-value">
                      {reportData?.totals?.total_prescriptions_checked?.toLocaleString() ||
                        "-"}
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={`green `}>
                    <div className="stats-title">
                      Percentual de Pacientes-Dia
                    </div>
                    <div className="stats-value">
                      {percentualPrescriptions?.toLocaleString() || "-"} %
                    </div>
                  </StatsCard>
                </Spin>
              </Col>

              {FeatureService.hasCPOE() && (
                <>
                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`blue `}>
                        <div className="stats-title">Total de Itens-Dia</div>
                        <div className="stats-value">
                          {reportData?.totals?.total_itens?.toLocaleString() ||
                            "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`green `}>
                        <div className="stats-title">Itens-Dia Checados</div>
                        <div className="stats-value">
                          {reportData?.totals?.total_itens_checked?.toLocaleString() ||
                            "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`green `}>
                        <div className="stats-title">
                          Percentual de Itens-Dia
                        </div>
                        <div className="stats-value">
                          {percentualItens?.toLocaleString() || "-"} %
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>

                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`blue `}>
                        <div className="stats-title">Total de Vidas</div>
                        <div className="stats-value">
                          {reportData?.totals?.total_patients?.toLocaleString() ||
                            "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`orange `}>
                        <div className="stats-title">Vidas Impactadas</div>
                        <div className="stats-value">
                          {reportData?.totals?.total_patients_checked?.toLocaleString() ||
                            "-"}
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                  <Col xs={12} lg={8}>
                    <Spin spinning={isLoading}>
                      <StatsCard className={`orange `}>
                        <div className="stats-title">% de Vidas Impactadas</div>
                        <div className="stats-value">
                          {percentualPatients?.toLocaleString() || "-"}%
                        </div>
                      </StatsCard>
                    </Spin>
                  </Col>
                </>
              )}

              <Col xs={12} lg={8}>
                <Spin spinning={isLoading}>
                  <StatsCard className={` `}>
                    <div className="stats-title">Média Escore Global</div>
                    <div className="stats-value">
                      {reportData?.totals?.avg_global_score?.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 },
                      ) || "-"}
                    </div>
                  </StatsCard>
                </Spin>
              </Col>
            </Row>
            <div className="page-break"></div>
            <SectionHeader>
              <h2>Pacientes-Dia</h2>
              <div>Relação entre Pacientes-Dia e Pacientes-Dia Checados</div>
            </SectionHeader>
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Spin spinning={isLoading}>
                  <ChartCard className={`${isLoading ? "loading" : ""}`}>
                    <ChartPrescriptionDay
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
    </>
  );
}
