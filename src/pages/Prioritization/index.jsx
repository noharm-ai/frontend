import withLayout from "lib/withLayout";
import Prioritization from "containers/Prioritization";

const layoutProps = {
  pageTitle: "Priorização",
  defaultSelectedKeys: "/",
};

export default withLayout(Prioritization, layoutProps);
