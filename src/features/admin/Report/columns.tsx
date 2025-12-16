import { EditOutlined } from "@ant-design/icons";
import { TableProps } from "antd";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { formatDateTime } from "src/utils/date";

const columns = (
  setReport: (data: any) => void,
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
      title: "Descrição",
      align: "left",
      dataIndex: "description",
    },
    {
      title: "Ativo",
      align: "center",
      render: (_, record) => {
        return record.active ? "Sim" : "Não";
      },
    },
    {
      title: "Atualizado em",
      align: "center",
      render: (_, record) => {
        if (record.updatedAt) {
          return formatDateTime(record.updated_at);
        }

        return formatDateTime(record.created_at);
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (_, record) => {
        return (
          <Tooltip title="Editar relatório">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => dispatch(setReport(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};
export default columns;
