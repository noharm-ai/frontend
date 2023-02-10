import withLayout from "lib/withLayout";
import InterventionReason from "features/admin/InterventionReason/InterventionReason";

const layoutProps = {
  theme: "boxed",
  pageTitle: "menu.interventionReasons",
};

export default withLayout(InterventionReason, layoutProps);
