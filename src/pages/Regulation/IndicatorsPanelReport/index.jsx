import withLayout from "lib/withLayout";
import IndicatorsPanelReport from "features/regulation/IndicatorsPanelReport/IndicatorsPanelReport";

const layoutProps = {};

const IndicatorsPanelReportWithLayout = withLayout(
  IndicatorsPanelReport,
  layoutProps
);

export default IndicatorsPanelReportWithLayout;
