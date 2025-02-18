import withLayout from "lib/withLayout";
import Screening from "containers/Screening";

const layoutProps = {
  pageTitle: "Prescrição",
  defaultSelectedKeys: "/",
};

const ScreeningWithLayout = withLayout(Screening, layoutProps);

export default ScreeningWithLayout;
