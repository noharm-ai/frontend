import withLayout from "lib/withLayout";
import Conciliation from "containers/Conciliation";

const layoutProps = {
  pageTitle: "Conciliação",
};

const ConciliationWithLayout = withLayout(Conciliation, layoutProps);

export default ConciliationWithLayout;
