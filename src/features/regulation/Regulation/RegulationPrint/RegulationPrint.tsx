import { useRef } from "react";
import { Skeleton, Space, Card } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "src/store";
import RegulationPatient from "../RegulationPatient/RegulationPatient";
import RegulationData from "../RegulationData/RegulationData";
import RegulationSchedules from "../RegulationSchedules/RegulationSchedules";
import { RegulationAttachments } from "../../RegulationAttribute/RegulationAttachments/RegulationAttachments";
import { formatDateTime } from "src/utils/date";
import CustomFormView from "src/components/Forms/CustomForm/View";

import { PrintHeader, PrintContainer } from "./RegulationPrint.style";
import { ReportFilterContainer } from "src/styles/Report.style";
// @ts-expect-error ts 2307 (legacy code)
import { NoHarmLogoHorizontal as Brand } from "assets/NoHarmLogoHorizontal";

export function RegulationPrint() {
  const solicitation = useAppSelector(
    (state) => state.regulation.regulation.data
  );
  const movements = useAppSelector(
    (state) => state.regulation.regulation.data.movements
  );
  const printRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  if (!solicitation?.id) {
    return (
      <>
        <Skeleton title paragraph={false} loading={true} active />
      </>
    );
  }

  return (
    <PrintContainer ref={printRef}>
      <PrintHeader className="report-header">
        <h1>Solicitação nº: {solicitation.id}</h1>
        <div className="brand">
          <Brand />
        </div>
      </PrintHeader>

      <ReportFilterContainer style={{ marginBottom: "15px" }}>
        <div className="report-filter-list">
          <strong>Gerado em:</strong> {dayjs().format("DD/MM/YY HH:mm")}
        </div>
      </ReportFilterContainer>

      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <RegulationPatient print={true} />
        <RegulationData print={true} />
        <RegulationSchedules />

        <RegulationAttachments
          idRegSolicitation={solicitation.id}
          print={true}
        />

        <h2 style={{ marginTop: "15px" }}>Histórico</h2>

        {movements.map((entry: any) => (
          <Card
            key={entry.id}
            title={`${formatDateTime(entry.createdAt)} - ${
              entry.action === -1
                ? "Solicitação criada"
                : t(`regulation.action.${entry.action}`)
            }`}
            variant="borderless"
            style={{ marginBottom: "15px" }}
          >
            {entry.action !== -1 && (
              <CustomFormView
                template={[
                  {
                    group: "Detalhes",
                    questions: entry.template,
                  },
                ]}
                values={entry.data}
              />
            )}
          </Card>
        ))}
      </Space>
    </PrintContainer>
  );
}
