import { EditOutlined } from "@ant-design/icons";
import { TableProps } from "antd";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { formatDateTime } from "src/utils/date";

const columns = (
  setProtocol: (data: any) => void,
  dispatch: (data: any) => void,
  t: any
): TableProps<any>["columns"] => {
  return [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Nome",
      dataIndex: "name",
    },
    {
      title: "Schema",
      render: (_, record) => {
        if (!record.schema) {
          return "Todos";
        }

        return record.schema;
      },
    },
    {
      title: "Tipo",
      align: "center",
      render: (_, record) => {
        return t(`protocolType.type_${record.protocolType}`);
      },
    },
    {
      title: "Situação",
      align: "center",
      render: (_, record) => {
        return t(`protocolStatus.status_${record.statusType}`);
      },
    },
    {
      title: "Atualizado em",
      align: "center",
      render: (_, record) => {
        if (record.updatedAt) {
          return formatDateTime(record.updatedAt);
        }

        return formatDateTime(record.createdAt);
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (_, record) => {
        return (
          <Tooltip title="Editar protocolo">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => dispatch(setProtocol(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};
export default columns;
