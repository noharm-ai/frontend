// @ts-expect-error missing types
import withLayout from "lib/withLayout";
import { InterventionConsolidatedReport } from "features/reports/InterventionConsolidatedReport/InterventionConsolidatedReport";

const layoutProps = {};

export const InterventionConsolidatedReportPage = withLayout(
  InterventionConsolidatedReport,
  layoutProps,
);
