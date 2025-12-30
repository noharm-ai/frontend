import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import { createSlug } from "utils/transformers/utils";

const columns = (t) => {
  return [
    {
      title: "Segmento",
      dataIndex: "segment",
      width: 150,
      align: "left",
      ellipsis: {
        showTitle: false,
      },
      render: (entry, record) => {
        if (!record.segment) {
          return (
            <Tooltip
              title={`Este medicamento está inconsistente. Utilize o botão "Atualizar Unidade Padrão" para ajustar. Segmento outlier: ${record.segmentOutlier}`}
            >
              {" "}
              <Tag color="orange">Inconsistente</Tag>
            </Tooltip>
          );
        }

        return <Tooltip title={record.segment}>{record.segment}</Tooltip>;
      },
    },
    {
      title: "Medicamento",
      dataIndex: "name",
      align: "left",
      render: (entry, record) => {
        return <Tooltip title={record.name}>{record.name}</Tooltip>;
      },
    },
    {
      title: "Unidade Padrão",
      dataIndex: "idMeasureUnitDefault",
      width: 180,
      render: (entry, record) => {
        if (!record.idMeasureUnitDefault) {
          return <Tag color="red">Vazio</Tag>;
        }

        return record.idMeasureUnitDefault;
      },
    },
    {
      title: "Unidade Custo",
      dataIndex: "idMeasureUnitPrice",
      width: 180,
      render: (entry, record) => {
        if (!record.idMeasureUnitPrice) {
          return <Tag color="red">Vazio</Tag>;
        }

        return record.idMeasureUnitPrice;
      },
    },
    {
      title: "Contagem",
      width: 100,
      render: (entry, record) => {
        return record.drugCount;
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        return (
          <Tooltip
            title={
              !record.idSegment
                ? 'Este medicamento está inconsistente. Utilize o botão "Atualizar Unidade Padrão".'
                : "Editar medicamento"
            }
          >
            <Button
              type="primary"
              icon={<EditOutlined />}
              disabled={!record.idSegment}
              onClick={() =>
                window.open(
                  `/medicamentos/${record.idSegment}/${
                    record.idDrug
                  }/${createSlug(record.name)}`,
                  "_blank"
                )
              }
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};

export default columns;
