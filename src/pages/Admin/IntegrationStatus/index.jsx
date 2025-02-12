import withLayout from "lib/withLayout";
import IntegrationStatus from "features/admin/IntegrationStatus/IntegrationStatus";

const layoutProps = {};

const IntegrationStatusWithLayout = withLayout(IntegrationStatus, layoutProps);

export default IntegrationStatusWithLayout;
