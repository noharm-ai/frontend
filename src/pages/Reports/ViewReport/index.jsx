import React from "react";

import withLayout from "lib/withLayout";
import ViewReport from "containers/Reports/ViewReport";
import PageHeader from "containers/Reports/ViewReport/PageHeader";

const layoutProps = {
  theme: "boxed",
  pageTitle: "Relatórios",
  defaultSelectedKeys: "/relatorios",
  renderHeader: (props) => <PageHeader {...props} />,
};

export default withLayout(ViewReport, layoutProps);
