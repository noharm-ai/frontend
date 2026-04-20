import React from "react";
import { Dropdown } from "antd";
import {
  EditOutlined,
  SearchOutlined,
  SwapOutlined,
  MoreOutlined,
} from "@ant-design/icons";

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
      width: 60,
      align: "center",
      render: (text, record) => {
        const menuItems = [
          {
            key: "edit",
            label: "Editar atributos",
            icon: <EditOutlined />,
          },
          {
            key: "unitConversion",
            label: "Conversões de unidade",
            icon: <SwapOutlined />,
          },
          {
            key: "openDrug",
            label: "Abrir tela do medicamento",
            icon: <SearchOutlined />,
          },
        ];

        const handleMenuClick = ({ key }) => {
          if (key === "edit") {
            bag.setDrugForm({
              idSegment: record.idSegment,
              idDrug: record.idDrug,
              name: record.name,
            });
          } else if (key === "unitConversion") {
            bag.openUnitConversion(record.idDrug);
          } else if (key === "openDrug") {
            window.open(
              `/painel-medicamentos/${record.idSegment}/${record.idDrug}/${createSlug(record.name)}`,
              "_blank",
            );
          }
        };

        return (
          <Tooltip
            title={
              !record.idSegment
                ? 'Este medicamento está inconsistente. Utilize o botão "Atualizar Unidade Padrão".'
                : null
            }
          >
            <Dropdown
              menu={{ items: menuItems, onClick: handleMenuClick }}
              trigger={["click"]}
              disabled={!record.idSegment}
            >
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Tooltip>
        );
      },
    },
  ];
};

export default columns;
