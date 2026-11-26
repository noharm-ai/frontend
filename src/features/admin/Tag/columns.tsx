import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Tag, TableProps } from "antd";
import { TFunction } from "i18next";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { canWriteTag } from "./tagPermissions";
import { ITag, setTag as setTagAction } from "./TagSlice";
import { AppDispatch } from "src/store";

export const columns = (
  setTag: typeof setTagAction,
  dispatch: AppDispatch,
  t: TFunction,
  // TODO(ts): components/Table is still JS, so its rows are typed as unknown
): TableProps<any>["columns"] => {
  return [
    {
      title: "Marcador",
      dataIndex: "name",
    },
    {
      title: "Tipo",
      align: "center",
      render: (_entry: unknown, record: ITag) => {
        switch (record.tagType) {
          case 1:
            return "Paciente";
          case 2:
            return "Paciente (Navegação)";
          default:
            return record.tagType;
        }
      },
    },
    {
      title: "Situação",
      align: "center",
      render: (_entry: unknown, record: ITag) => {
        return record.active ? (
          <Tag color="green">Ativo</Tag>
        ) : (
          <Tag>Inativo</Tag>
        );
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (_text: unknown, record: ITag) => {
        // write access depends on the tag type: WRITE_PATIENT_TAGS covers
        // navigation tags only
        const label = canWriteTag(record.tagType)
          ? "Editar marcador"
          : "Visualizar marcador";

        return (
          <Tooltip title={label}>
            <Button
              type="primary"
              aria-label={label}
              icon={
                canWriteTag(record.tagType) ? <EditOutlined /> : <EyeOutlined />
              }
              onClick={() => dispatch(setTag(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};
