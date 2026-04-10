import React from "react";
import { format } from "date-fns";
import { SettingOutlined } from "@ant-design/icons";

import NumericValue from "components/NumericValue";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import Tag from "components/Tag";
import PermissionService from "src/services/PermissionService";
import Permission from "src/models/Permission";

import ValuedExams from "./ValuedExams";
import TextualExams from "./TextualExams";

const columns = (t, sortedInfo) => {
  const cols = [
    {
      title: t("tableHeader.exam"),
      dataIndex: "name",
      align: "left",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.column?.dataIndex === "name" && sortedInfo.order,
    },
    {
      title: t("tableHeader.percentage"),
      dataIndex: "perc",
      align: "center",
    },
    {
      title: t("tableHeader.value"),
      dataIndex: "value",
      align: "center",
      sorter: (a, b) => a.value - b.value,
      sortOrder: sortedInfo.column?.dataIndex === "value" && sortedInfo.order,
      render: (text, record) => {
        if (record.text) {
          return "--";
        }
        return (
          <NumericValue
            suffix={record.unit ? ` ${record.unit}` : ""}
            value={record.value}
          />
        );
      },
    },
    {
      title: t("tableHeader.reference"),
      dataIndex: "ref",
      align: "left",
    },

    {
      title: t("tableHeader.date"),
      dataIndex: "date",
      align: "center",
      sorter: (a, b) => a.date.localeCompare(b.date),
      sortOrder: sortedInfo.column?.dataIndex === "date" && sortedInfo.order,
      render: (text, record) => {
        return format(new Date(record.date), "dd/MM/yyyy HH:mm");
      },
    },
    {
      title: "Origem",
      dataIndex: "source",
      align: "center",
      hidden: !PermissionService().has(Permission.MAINTAINER),
    },
    {
      title: "Configurado",
      dataIndex: "configured",
      align: "center",
      render: (configured) =>
        configured ? (
          <Tag color="green">Sim</Tag>
        ) : (
          <Tag color="default">Não</Tag>
        ),
    },
  ];

  if (PermissionService().has(Permission.ADMIN_EXAMS)) {
    cols.push({
      title: "Ações",
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => (
        <Tooltip title="Configurar exame">
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => record.onConfigure(record)}
            ghost={record.configured}
          />
        </Tooltip>
      ),
    });
  }

  return cols;
};

export const textualColumns = (t, sortedInfo) => {
  const cols = [
    {
      title: t("tableHeader.exam"),
      dataIndex: "name",
      align: "left",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.column?.dataIndex === "name" && sortedInfo.order,
    },
    {
      title: "Texto",
      dataIndex: "ref",
      align: "left",
    },
    {
      title: t("tableHeader.date"),
      dataIndex: "date",
      align: "center",
      sorter: (a, b) => a.date.localeCompare(b.date),
      sortOrder: sortedInfo.column?.dataIndex === "date" && sortedInfo.order,
      render: (text, record) => {
        return format(new Date(record.date), "dd/MM/yyyy HH:mm");
      },
    },
  ];

  return cols;
};

export const examRowClassName = (record) => {
  if (record.alert) {
    return "danger";
  }

  return "";
};

export const expandedExamRowRender = (record) => {
  if (record.text) {
    return <TextualExams record={record} />;
  }

  return <ValuedExams record={record} />;
};

export default columns;
