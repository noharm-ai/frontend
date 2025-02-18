import withLayout from "lib/withLayout";
import PrescriptionAuditReport from "features/reports/PrescriptionAuditReport/PrescriptionAuditReport";

const layoutProps = {};

const PrescriptionAuditReportWithLayout = withLayout(
  PrescriptionAuditReport,
  layoutProps
);

export default PrescriptionAuditReportWithLayout;
