import withLayout from "lib/withLayout";
import PrescriptionReport from "features/reports/PrescriptionReport/PrescriptionReport";

const layoutProps = {};

const PrescriptionReportWithLayout = withLayout(
  PrescriptionReport,
  layoutProps
);

export default PrescriptionReportWithLayout;
