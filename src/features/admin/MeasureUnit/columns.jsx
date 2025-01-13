import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";

const columns = (setMeasureUnit, dispatch, t) => {
  return [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Unidade de medida",
      dataIndex: "name",
    },
    {
      title: "Unidade NoHarm",
      dataIndex: "measureUnitNh",
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        return (
          <Tooltip title="Editar unidade de medida">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => dispatch(setMeasureUnit(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};
export default columns;
