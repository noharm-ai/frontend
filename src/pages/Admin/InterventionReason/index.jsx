import withLayout from "lib/withLayout";
import InterventionReason from "features/admin/InterventionReason/InterventionReason";

const layoutProps = {};

const InterventionReasonWithLayout = withLayout(
  InterventionReason,
  layoutProps
);

export default InterventionReasonWithLayout;
