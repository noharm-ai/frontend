// @ts-expect-error missing types
import withLayout from "lib/withLayout";
import { InfectionControlConsolidatedReport } from "features/reports/InfectionControlConsolidatedReport/InfectionControlConsolidatedReport";

const layoutProps = {};

export const InfectionControlConsolidatedReportPage = withLayout(
  InfectionControlConsolidatedReport,
  layoutProps,
);
