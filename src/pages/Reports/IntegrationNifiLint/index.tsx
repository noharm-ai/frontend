import withLayout from "src/lib/withLayout";
import { IntegrationNifiLintReport } from "src/features/reports/IntegrationNifiLintReport/IntegrationNifiLintReport";

const layoutProps = {};

const IntegrationNifiLintReportWithLayout = withLayout(
  IntegrationNifiLintReport,
  layoutProps
);

export default IntegrationNifiLintReportWithLayout;
