import React from "react";
import { Dropdown } from "antd";
import {
  EditOutlined,
  SearchOutlined,
  SwapOutlined,
  MoreOutlined,
  CheckSquareOutlined,
  BorderOutlined,
} from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import { createSlug } from "utils/transformers/utils";
import EditSubstance from "./EditSubstance";
import { formatNumber } from "src/utils/number";

const columns = (t, bag) => {
  const segmentColumn = {
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
  };

  return [
    ...(bag.config.columns.includes("segment") ? [segmentColumn] : []),
    {
      title: "Medicamento",
      dataIndex: "name",
      align: "left",
      width: bag.mode === "substanceDefinition" ? "50%" : undefined,
      hidden: !bag.config.columns.includes("name"),
      render: (entry, record) => {
        return <Tooltip title={record.name}>{record.name}</Tooltip>;
      },
    },
    {
      title: "Substância",
      align: "left",
      width: bag.mode === "substanceDefinition" ? "50%" : undefined,
      hidden: !bag.config.columns.includes("substance"),
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
      title: "Divisor de faixas",
      align: "center",
      hidden: !bag.config.columns.includes("doseRange"),
      render: (entry, record) => {
        return <>{record.doseRange ? formatNumber(record.doseRange, 3) : ""}</>;
      },
    },
    {
      title: "Considera peso",
      align: "center",
      hidden: !bag.config.columns.includes("useWeight"),
      render: (entry, record) => {
        return <>{record.useWeight ? "Sim" : ""}</>;
      },
    },
    {
      title: bag.selectedRowsActive ? (
        <Tooltip
          title={bag.isAllSelected ? "Desmarcar todos" : "Selecionar todos"}
        >
          <Button
            type={bag.isAllSelected ? "primary" : "default"}
            onClick={bag.selectAllRows}
            icon={
              bag.isAllSelected ? <CheckSquareOutlined /> : <BorderOutlined />
            }
          />
        </Tooltip>
      ) : (
        t("tableHeader.action")
      ),
      key: "operations",
      width: 60,
      align: "center",
      hidden: bag.mode === "substanceDefinition" && !bag.selectedRowsActive,
      render: (text, record) => {
        if (bag.selectedRowsActive) {
          const selected = bag.selectedRows.includes(record.key);
          return (
            <Tooltip title={selected ? null : "Selecionar"}>
              <Button
                type={selected ? "primary" : "default"}
                onClick={() => bag.toggleSelectedRows(record.key)}
                icon={
                  selected ? (
                    <CheckSquareOutlined style={{ fontSize: 16 }} />
                  ) : (
                    <BorderOutlined style={{ fontSize: 16 }} />
                  )
                }
              />
            </Tooltip>
          );
        }

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
