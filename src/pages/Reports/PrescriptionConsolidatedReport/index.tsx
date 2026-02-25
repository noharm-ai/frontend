// @ts-expect-error missing types
import withLayout from "lib/withLayout";
import PrescriptionConsolidatedReport from "features/reports/PrescriptionConsolidatedReport/PrescriptionConsolidatedReport";

const layoutProps = {};

const PrescriptionConsolidatedReportWithLayout = withLayout(
  PrescriptionConsolidatedReport,
  layoutProps,
);

export default PrescriptionConsolidatedReportWithLayout;
