import withLayout from "lib/withLayout";
import DrugAttributes from "features/admin/DrugAttributes/DrugAttributes";

const layoutProps = {};
const DrugAttributesWithLayout = withLayout(DrugAttributes, layoutProps);

export default DrugAttributesWithLayout;
