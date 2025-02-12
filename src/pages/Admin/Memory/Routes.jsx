import withLayout from "lib/withLayout";
import MemoryRoutes from "features/admin/Memory/Routes/Routes";

const layoutProps = {};

const MemoryRoutesWithLayout = withLayout(MemoryRoutes, layoutProps);

export default MemoryRoutesWithLayout;
