import React from "react";
import { DownOutlined, LoadingOutlined } from "@ant-design/icons";

import Tag from "components/Tag";

export default function NodeStatusTag({
  status,
  loading,
  showIcon = true,
  ...props
}) {
  let color = null;

  switch (status) {
    case "Running":
      color = "success";
      break;
    case "Stopped":
      color = "error";
      break;
    default:
      color = null;
  }

  return (
    <Tag color={color} style={{ cursor: "pointer" }} {...props}>
      {status}
      {showIcon && (
        <>
          {loading ? (
            <LoadingOutlined style={{ marginLeft: "10px" }} />
          ) : (
            <DownOutlined style={{ marginLeft: "10px" }} />
          )}
        </>
      )}
    </Tag>
  );
}
