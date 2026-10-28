import { useTranslation } from "react-i18next";
import { Row, Col, Table } from "antd";
import type { TableColumnsType } from "antd";

import { SectionHeader } from "styles/Report.style";

import { Indicator } from "../../Indicator/Indicator";
import { Block } from "../../Block/Block";
import { PieChart } from "../../PieChart/PieChart";
import {
  IndicatorGrid,
  Section,
} from "../../InfectionControlConsolidatedReport.style";
import { formatDecimal, formatMedian, formatShare } from "../../format";
import {
  IAgeBand,
  IDiagnosis,
  IOutcomes,
} from "../../infectionControlReportTypes";

interface OutcomesProps {
  outcomes?: IOutcomes;
  loading: boolean;
}

/** Profile of the closed admissions: length of stay, age, sex and diagnoses. */
export function Outcomes({ outcomes, loading }: OutcomesProps) {
  const { t } = useTranslation();
  const tk = (key: string) => t(`infectionControlConsolidated.outcomes.${key}`);
  const data: Partial<IOutcomes> = outcomes || {};
  const days = t("infectionControlConsolidated.units.days");
  const right = "right" as const;

  const ageColumns: TableColumnsType<IAgeBand> = [
    { title: tk("ageBand"), dataIndex: "ageBand", key: "ageBand" },
    {
      title: tk("admissions"),
      dataIndex: "admissions",
      key: "admissions",
      align: right,
    },
    {
      title: tk("dotPerAdmission"),
      dataIndex: "dotPerAdmission",
      key: "dotPerAdmission",
      align: right,
      render: (value: number) => formatDecimal(value),
    },
  ];

  const diagnosisColumns: TableColumnsType<IDiagnosis> = [
    {
      title: tk("cid"),
      dataIndex: "idcid",
      key: "idcid",
      render: (idcid: string, row: IDiagnosis) =>
        row.name ? `${idcid} - ${row.name}` : idcid,
    },
    {
      title: tk("admissions"),
      dataIndex: "admissions",
      key: "admissions",
      align: right,
    },
    {
      title: tk("dotPerAdmission"),
      dataIndex: "dotPerAdmission",
      key: "dotPerAdmission",
      align: right,
      render: (value: number) => formatDecimal(value),
    },
  ];

  return (
    <Section>
      <SectionHeader>
        <h2>{tk("title")}</h2>
        <div>{tk("description")}</div>
      </SectionHeader>

      <IndicatorGrid data-kb="reports.infectionControl.outcomes">
        <Indicator
          title={tk("los")}
          value={formatMedian(data.lengthOfStayDays, days)}
          help={tk("losHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("endToDischarge")}
          value={formatMedian(data.antimicrobialEndToDischargeDays, days)}
          help={tk("endToDischargeHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("stillInHospital")}
          value={formatShare(data.stillInHospitalShare)}
          help={tk("stillInHospitalHelp")}
          loading={loading}
        />
      </IndicatorGrid>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Block
            title={tk("byAge")}
            help={tk("byAgeHelp")}
            loading={loading}
            kb="reports.infectionControl.age"
          >
            <Table<IAgeBand>
              columns={ageColumns}
              dataSource={data.byAgeBand || []}
              rowKey={(row: IAgeBand) => row.ageBand}
              pagination={false}
              size="small"
            />
          </Block>
        </Col>
        <Col xs={24} lg={12}>
          <Block
            title={tk("bySex")}
            help={tk("bySexHelp")}
            loading={loading}
            kb="reports.infectionControl.sex"
          >
            <PieChart
              loading={loading}
              slices={Object.entries(data.bySex || {}).map(([sex, count]) => ({
                name: t(`infectionControlConsolidated.sex.${sex}`, sex),
                value: count,
              }))}
            />
          </Block>
        </Col>
        <Col xs={24}>
          <Block
            title={tk("diagnoses")}
            help={tk("diagnosesHelp")}
            loading={loading}
            kb="reports.infectionControl.diagnoses"
          >
            <Table<IDiagnosis>
              columns={diagnosisColumns}
              dataSource={data.diagnoses || []}
              rowKey={(row: IDiagnosis) => row.idcid}
              pagination={false}
              size="small"
            />
          </Block>
        </Col>
      </Row>
    </Section>
  );
}
