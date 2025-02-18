import React from "react";

import withLayout from "lib/withLayout";
import UserConfig from "containers/UserConfig";

import PageHeader from "./PageHeader";

const layoutProps = {
  theme: "boxed",
  pageTitle: "menu.userConfig",
  renderHeader: (props) => <PageHeader {...props} />,
};

const UserConfigWithLayout = withLayout(UserConfig, layoutProps);

export default UserConfigWithLayout;
