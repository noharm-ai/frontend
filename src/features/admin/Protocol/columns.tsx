import { CopyOutlined, EditOutlined } from "@ant-design/icons";
import { Space, TableProps } from "antd";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { formatDateTime } from "src/utils/date";

interface ColumnsOptions {
  currentSchema: string;
  onCopy: (record: any) => void;
  copyingId: number | null;
}

const columns = (
  navigate: (path: string) => void,
  t: any,
  { currentSchema, onCopy, copyingId }: ColumnsOptions,
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
      width: 110,
      align: "center",
      render: (_, record) => {
        // Global protocols ("Todos", schema NULL) are maintained from any
        // schema; schema-owned ones only by their owner. The rest can only be
        // used as a copy source, since the upsert rejects them.
        const isEditable = !record.schema || record.schema === currentSchema;

        return (
          <Space>
            <Tooltip
              title={
                isEditable
                  ? "Editar protocolo"
                  : "Protocolo de outro schema: só pode ser copiado"
              }
            >
              <Button
                type="primary"
                aria-label="Editar protocolo"
                icon={<EditOutlined />}
                disabled={!isEditable}
                onClick={() => navigate(`/admin/protocolos/${record.id}`)}
              ></Button>
            </Tooltip>
            <Tooltip title="Copiar protocolo">
              <Button
                aria-label="Copiar protocolo"
                icon={<CopyOutlined />}
                loading={copyingId === record.id}
                disabled={copyingId !== null}
                onClick={() => onCopy(record)}
              ></Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];
};
export default columns;
