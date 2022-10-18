import withLayout from "lib/withLayout";
import Frequency from "containers/Admin/Frequency";

const layoutProps = {
  theme: "boxed",
  pageTitle: "menu.frequency",
};

export default withLayout(Frequency, layoutProps);
