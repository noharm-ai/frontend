import withLayout from "src/lib/withLayout";
import { GlobalMemoryNZero } from "features/admin/GlobalMemory/GlobalMemoryNZero/GlobalMemoryNZero";

const layoutProps = {};

const GlobalMemoryNZeroWithLayout = withLayout(GlobalMemoryNZero, layoutProps);

export default GlobalMemoryNZeroWithLayout;
