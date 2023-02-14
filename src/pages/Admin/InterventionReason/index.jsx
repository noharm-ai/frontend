import withLayout from "lib/withLayout";
import InterventionReason from "features/admin/InterventionReason/InterventionReason";

const layoutProps = {
  theme: "boxed",
  renderHeader: false,
};

export default withLayout(InterventionReason, layoutProps);
