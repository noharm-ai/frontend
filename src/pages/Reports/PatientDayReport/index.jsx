import withLayout from "lib/withLayout";
import PatientDayReport from "features/reports/PatientDayReport/PatientDayReport";

const layoutProps = {};

const PatientDayReportWithLayout = withLayout(PatientDayReport, layoutProps);

export default PatientDayReportWithLayout;
