import { EditOutlined } from "@ant-design/icons";
import { TableProps } from "antd";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";

const columns = (
  setGlobalExam: (data: any) => void,
  dispatch: (data: any) => void,
  t: any
): TableProps<any>["columns"] => {
  return [
    {
      title: "TP Exame",
      dataIndex: "tp_exam",
      width: 150,
    },
    {
      title: "Nome",
      dataIndex: "name",
      ellipsis: true,
    },
    {
      title: "Rótulo",
      dataIndex: "initials",
      width: 120,
    },
    {
      title: "Unidade",
      dataIndex: "measureunit",
      width: 100,
    },
    {
      title: "Valores Adulto",
      align: "center",
      width: 150,
      render: (_, record) => {
        return `${record.min_adult} - ${record.max_adult}`;
      },
    },
    {
      title: "Valores Pediátrico",
      align: "center",
      width: 150,
      render: (_, record) => {
        return `${record.min_pediatric} - ${record.max_pediatric}`;
      },
    },
    {
      title: "Situação",
      dataIndex: "active",
      align: "center",
      width: 80,
      render: (active: boolean) => {
        return active ? (
          <Tag color="green">Ativo</Tag>
        ) : (
          <Tag color="red">Inativo</Tag>
        );
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (_, record) => {
        return (
          <Tooltip title="Editar exame global">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => dispatch(setGlobalExam(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};

export default columns;
