import React from "react";
import { Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { formatNumber } from "utils/number";

const columns = (setFrequency, dispatch, t) => {
  return [
    {
      title: "Frequência",
      dataIndex: "name",
    },
    {
      title: "Frequência Dia",
      align: "right",
      render: (entry, record) => {
        if (record.dailyFrequency) {
          return formatNumber(record.dailyFrequency, 6);
        }

        return <Tag color="error">Vazio</Tag>;
      },
    },
    {
      title: "Jejum",
      align: "center",
      render: (entry, record) => {
        return record.fasting ? "Sim" : "Não";
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        return (
          <Tooltip title="Editar frequência">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => dispatch(setFrequency(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};
export default columns;
