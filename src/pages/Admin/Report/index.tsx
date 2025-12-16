import withLayout from "src/lib/withLayout";
import { Report } from "features/admin/Report/Report";

const layoutProps = {};

const PageWithLayout = withLayout(Report, layoutProps);

export default PageWithLayout;
