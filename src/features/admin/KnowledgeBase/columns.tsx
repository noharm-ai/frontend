import { EditOutlined } from "@ant-design/icons";
import { TableProps, Tag, Space } from "antd";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { formatDateTime } from "src/utils/date";

const columns = (
  setKnowledgeBase: (data: any) => void,
  dispatch: (data: any) => void,
  t: any,
): TableProps<any>["columns"] => {
  return [
    {
      title: "Título",
      dataIndex: "title",
    },
    {
      title: "Páginas relacionadas",
      render: (_, record) => (
        <Space wrap>
          {(record.path || []).map((p: string) => <Tag key={p}>{p}</Tag>)}
        </Space>
      ),
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
          <Tooltip title="Editar registro">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => dispatch(setKnowledgeBase(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};

export default columns;
