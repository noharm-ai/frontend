import DefaultModal from "components/Modal";
import { Card, Statistic, Row, Col, Tag, Tooltip } from "antd";

import { useAppSelector, useAppDispatch } from "src/store";
import { setSummaryVisibility } from "../IndicatorsPanelReportSlice";
import { RegulationReportIndicatorEnum } from "src/models/regulation/RegulationReportIndicatorEnum";

export function Summary() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(
    (state) => state.regulation.indicatorsPanelReport.summary.open
  );
  const data = useAppSelector(
    (state) => state.regulation.indicatorsPanelReport.summary.data
  );

  const config = [
    {
      panel: "Painel: Prevenção do Câncer",
      total: 0,
      indicators: [
        {
          key: RegulationReportIndicatorEnum.HPV_EXAM,
          title: "(A) Rastreamento para câncer do colo de útero",
        },
        {
          key: RegulationReportIndicatorEnum.HPV_VACCINE,
          title: "(B) Vacinação HPV",
        },
        {
          key: RegulationReportIndicatorEnum.SEXUAL_ATTENTION_APPOINTMENT,
          title: "(C) Atendimento para a saúde sexual e reprodutiva",
        },
        {
          key: RegulationReportIndicatorEnum.MAMMOGRAM_EXAM,
          title: "(D) Mamografia - rastreamento para câncer de mama",
        },
      ],
    },
    {
      panel: "Painel: Gestante",
      total: 0,
      indicators: [
        {
          key: RegulationReportIndicatorEnum.GESTATIONAL_APPOINTMENT,
          title: "(A) Consulta Gestante",
        },
      ],
    },
  ];

  config.forEach((c) => {
    let total = 0;
    c.indicators.forEach((i) => {
      const value = Object.prototype.hasOwnProperty.call(data, i.key)
        ? data[i.key].value
        : 0;
      total += value;
    });

    c.total = total;
  });

  return (
    <DefaultModal
      open={open}
      width={800}
      centered
      destroyOnHidden
      onCancel={() => dispatch(setSummaryVisibility(false))}
      footer={null}
    >
      <header>
        <h2 className="modal-title">Resumo de Indicadores</h2>
      </header>

      {config.map((c) => (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 className="modal-section-title" style={{ marginTop: "15px" }}>
              {c.panel}
            </h3>
            <div>
              <Tooltip title="Classificação do indicador">
                <ScoreTag total={c.total} />
              </Tooltip>
            </div>
          </div>

          <div
            style={{
              background: "#f5f5f5",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <Row gutter={[12, 12]}>
              {c.indicators.map((i) => (
                <Col xs={24} lg={12}>
                  <Card>
                    <Statistic
                      title={i.title}
                      value={
                        data &&
                        Object.prototype.hasOwnProperty.call(data, i.key)
                          ? data[i.key].value
                          : 0
                      }
                      suffix={
                        data &&
                        Object.prototype.hasOwnProperty.call(data, i.key)
                          ? `/ ${data[i.key].weight}`
                          : null
                      }
                      precision={2}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </>
      ))}
    </DefaultModal>
  );
}

const ScoreTag = ({ total }: { total: number }) => {
  if (total > 75) {
    return <Tag color="purple">Ótimo: {Math.ceil(total)}</Tag>;
  }

  if (total > 50 && total <= 75) {
    return <Tag color="green">Bom: {Math.ceil(total)}</Tag>;
  }

  if (total > 25 && total <= 50) {
    return <Tag color="gold">Suficiente: {Math.ceil(total)}</Tag>;
  }

  return <Tag color="red">Regular: {Math.ceil(total)}</Tag>;
};
