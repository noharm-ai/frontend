// @ts-expect-error missing types
import withLayout from "lib/withLayout";
import PatientDayConsolidatedReport from "features/reports/PatientDayConsolidatedReport/PatientDayConsolidatedReport";

const layoutProps = {};

const PatientDayConsolidatedReportWithLayout = withLayout(
  PatientDayConsolidatedReport,
  layoutProps,
);

export default PatientDayConsolidatedReportWithLayout;
