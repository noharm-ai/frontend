import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import { createSlug } from "utils/transformers/utils";

import EditPriceConversion from "./EditPriceConversion";

const columns = (t) => {
  return [
    {
      title: "Segmento",
      dataIndex: "segment",
      render: (entry, record) => {
        return record.segment;
      },
    },
    {
      title: "Medicamento",
      dataIndex: "name",
      ellipsis: {
        showTitle: false,
      },
      render: (entry, record) => {
        return <Tooltip title={record.name}>{record.name}</Tooltip>;
      },
    },
    {
      title: "Substância",
      dataIndex: "name",
      ellipsis: {
        showTitle: false,
      },
      render: (entry, record) => {
        if (!record.substance) {
          return <Tag color="red">Vazio</Tag>;
        }

        return <Tooltip title={record.substance}>{record.substance}</Tooltip>;
      },
    },
    {
      title: "Unidade Padrão",
      dataIndex: "idMeasureUnitDefault",
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
      render: (entry, record) => {
        if (!record.idMeasureUnitPrice) {
          return <Tag color="red">Vazio</Tag>;
        }

        return record.idMeasureUnitPrice;
      },
    },
    {
      title: "Fator Unidade Custo",
      dataIndex: "measureUnitPriceFactor",
      render: (entry, record) => {
        if (
          record.idMeasureUnitDefault === record.idMeasureUnitPrice &&
          record.idMeasureUnitPrice != null
        ) {
          return 1;
        }

        return (
          <EditPriceConversion
            idDrug={record.idDrug}
            idSegment={record.idSegment}
            idMeasureUnitPrice={record.idMeasureUnitPrice}
            factor={record.measureUnitPriceFactor}
          />
        );
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        return (
          <Tooltip title="Editar medicamento">
            <Button
              type="primary"
              icon={<EditOutlined />}
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
