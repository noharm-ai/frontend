import React from "react";
import Icon, { InfoCircleFilled } from "@ant-design/icons";

const CustomIcon = ({ component, ...props }) => {
  return <Icon component={component} {...props} />;
};

export const InfoIcon = () => {
  return (
    <InfoCircleFilled
      style={{
        fontSize: "80%",
        verticalAlign: "top",
        color: "var(--nh-text-color)",
      }}
    />
  );
};

export default CustomIcon;
