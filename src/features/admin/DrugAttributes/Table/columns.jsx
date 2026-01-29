import React from "react";
import { Space } from "antd";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import { createSlug } from "utils/transformers/utils";
import EditSubstance from "./EditSubstance";

const columns = (t, bag) => {
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
      title: "Substância",
      align: "left",
      render: (entry, record) => {
        return (
          <EditSubstance
            idDrug={record.idDrug}
            sctid={record.sctid}
            accuracy={record.substanceAccuracy}
          />
        );
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 120,
      align: "center",
      render: (text, record) => {
        return (
          <Space>
            <Tooltip
              title={
                !record.idSegment
                  ? 'Este medicamento está inconsistente. Utilize o botão "Atualizar Unidade Padrão".'
                  : "Editar atributos"
              }
            >
              <Button
                type="primary"
                icon={<EditOutlined />}
                disabled={!record.idSegment}
                onClick={() =>
                  bag.setDrugForm({
                    idSegment: record.idSegment,
                    idDrug: record.idDrug,
                    name: record.name,
                  })
                }
              />
            </Tooltip>
            <Tooltip
              title={
                !record.idSegment
                  ? 'Este medicamento está inconsistente. Utilize o botão "Atualizar Unidade Padrão".'
                  : "Abrir tela do medicamento"
              }
            >
              <Button
                type="primary"
                icon={<SearchOutlined />}
                disabled={!record.idSegment}
                onClick={() =>
                  window.open(
                    `/medicamentos/${record.idSegment}/${
                      record.idDrug
                    }/${createSlug(record.name)}`,
                    "_blank",
                  )
                }
              ></Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];
};

export default columns;
