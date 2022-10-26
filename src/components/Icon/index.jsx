import "antd/lib/icon/style/index.css";
import React from "react";
import isEmpty from "lodash.isempty";
import Icon, { InfoCircleFilled } from "@ant-design/icons";

import * as icons from "./svgs";

const CustomIcon = ({ type, ...props }) => {
  const component = icons[type];

  if (isEmpty(component)) {
    return null;
  }

  return <Icon component={component} {...props} />;
};

export const InfoIcon = (props) => {
  return <InfoCircleFilled style={{ fontSize: "80%", verticalAlign: "top" }} />;
};

export default CustomIcon;
