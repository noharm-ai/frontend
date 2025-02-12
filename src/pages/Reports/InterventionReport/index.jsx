import withLayout from "lib/withLayout";
import InterventionReport from "features/reports/InterventionReport/InterventionReport";

const layoutProps = {};

const InterventionReportWithLayout = withLayout(
  InterventionReport,
  layoutProps
);

export default InterventionReportWithLayout;
