import withLayout from "src/lib/withLayout";
import CustomForms from "features/memory/CustomForms/CustomForms";

const layoutProps = {};

const CustomFormsWithLayout = withLayout(CustomForms, layoutProps);

export default CustomFormsWithLayout;
