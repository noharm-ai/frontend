import React from "react";
import withLayout from "lib/withLayout";
import InterventionList from "containers/InterventionList";
import PageHeader from "containers/InterventionList/PageHeader";

const layoutProps = {
  theme: "boxed",
  pageTitle: "menu.interventions",
  renderHeader: (props) => <PageHeader {...props} />,
};

export default withLayout(InterventionList, layoutProps);
