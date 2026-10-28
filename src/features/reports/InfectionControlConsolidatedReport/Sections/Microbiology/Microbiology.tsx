import { useTranslation } from "react-i18next";
import { Table } from "antd";
import type { TableColumnsType } from "antd";

import { SectionHeader } from "styles/Report.style";

import { Indicator } from "../../Indicator/Indicator";
import { Block } from "../../Block/Block";
import {
  IndicatorGrid,
  Section,
} from "../../InfectionControlConsolidatedReport.style";
import { formatInteger, formatShare } from "../../format";
import {
  IMicrobiology,
  IMicroorganism,
} from "../../infectionControlReportTypes";

interface MicrobiologyProps {
  microbiology?: IMicrobiology;
  loading: boolean;
}

/** Cultures around the start of the courses and resistant results while in use. */
export function Microbiology({ microbiology, loading }: MicrobiologyProps) {
  const { t } = useTranslation();
  const tk = (key: string) =>
    t(`infectionControlConsolidated.microbiology.${key}`);
  const data: Partial<IMicrobiology> = microbiology || {};

  const columns: TableColumnsType<IMicroorganism> = [
    {
      title: tk("microorganism"),
      dataIndex: "microorganism",
      key: "microorganism",
    },
    {
      title: tk("admissions"),
      dataIndex: "admissions",
      key: "admissions",
      align: "right" as const,
    },
  ];

  return (
    <Section>
      <SectionHeader>
        <h2>{tk("title")}</h2>
        <div>{tk("description")}</div>
      </SectionHeader>

      <IndicatorGrid data-kb="reports.infectionControl.microbiology">
        <Indicator
          title={tk("collectedBefore")}
          value={formatShare(data.collectedBeforeStartShare)}
          help={tk("collectedBeforeHelp")}
          color="green"
          loading={loading}
        />
        <Indicator
          title={tk("collected")}
          value={formatInteger(data.culturesCollected)}
          help={tk("collectedHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("positive")}
          value={formatShare(data.positiveShare)}
          help={tk("positiveHelp")}
          loading={loading}
        />
        <Indicator
          title={tk("resistant")}
          value={formatShare(data.resistantInUseShare)}
          help={tk("resistantHelp")}
          color="red"
          loading={loading}
        />
      </IndicatorGrid>

      <Block
        title={tk("microorganisms")}
        help={tk("microorganismsHelp")}
        loading={loading}
        kb="reports.infectionControl.microorganisms"
      >
        <Table<IMicroorganism>
          columns={columns}
          dataSource={data.microorganisms || []}
          rowKey={(row) => row.microorganism}
          pagination={false}
          size="small"
        />
      </Block>
    </Section>
  );
}
