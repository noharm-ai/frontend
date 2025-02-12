import withLayout from "lib/withLayout";
import MemoryReports from "features/admin/Memory/Reports/Reports";

const layoutProps = {};

const MemoryReportsWithLayout = withLayout(MemoryReports, layoutProps);

export default MemoryReportsWithLayout;
