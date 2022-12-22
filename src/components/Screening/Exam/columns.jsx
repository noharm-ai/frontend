import React from "react";
import { format } from "date-fns";

import NumericValue from "components/NumericValue";

import ValuedExams from "./ValuedExams";
import TextualExams from "./TextualExams";

const columns = (t, sortedInfo) => {
  return [
    {
      title: t("tableHeader.exam"),
      dataIndex: "name",
      align: "left",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
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
      sortOrder: sortedInfo.columnKey === "value" && sortedInfo.order,
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
      sortOrder: sortedInfo.columnKey === "date" && sortedInfo.order,
      render: (text, record) => {
        return format(new Date(record.date), "dd/MM/yyyy HH:mm");
      },
    },
  ];
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
