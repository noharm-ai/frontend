import withLayout from "lib/withLayout";
import References from "containers/References";

const layoutProps = {
  theme: "boxed",
  pageTitle: "menu.medications",
};

const ReferencesWithLayout = withLayout(References, layoutProps);

export default ReferencesWithLayout;
