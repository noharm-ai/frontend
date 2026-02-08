import withLayout from "src/lib/withLayout";
import { FileReport } from "features/reports/FileReport/FileReport";

const layoutProps = {};

const FileReportWithLayout = withLayout(FileReport, layoutProps);

export default FileReportWithLayout;
