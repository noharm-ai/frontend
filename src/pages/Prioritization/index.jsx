import withLayout from "lib/withLayout";
import Prioritization from "containers/Prioritization";

const layoutProps = {
  pageTitle: "Priorização",
  defaultSelectedKeys: "/",
};

const PrioritizationWithLayout = withLayout(Prioritization, layoutProps);

export default PrioritizationWithLayout;
