import withLayout from "src/lib/withLayout";
import { DrugDashboard } from "features/drugs/DrugDashboard/DrugDashboard";

const layoutProps = {};

const DrugDashboardWithLayout = withLayout(DrugDashboard, layoutProps);

export default DrugDashboardWithLayout;
