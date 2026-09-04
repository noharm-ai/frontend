// @ts-expect-error missing types
import withLayout from "lib/withLayout";
import EconomyConsolidatedReport from "features/reports/EconomyConsolidatedReport/EconomyConsolidatedReport";

const layoutProps = {};

const EconomyConsolidatedReportWithLayout = withLayout(
  EconomyConsolidatedReport,
  layoutProps,
);

export default EconomyConsolidatedReportWithLayout;
