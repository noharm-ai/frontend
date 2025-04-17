import withLayout from "src/lib/withLayout";
import { Protocol } from "features/admin/Protocol/Protocol";

const layoutProps = {};

const ProtocolWithLayout = withLayout(Protocol, layoutProps);

export default ProtocolWithLayout;
