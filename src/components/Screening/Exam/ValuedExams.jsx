import React from "react";
import { format } from "date-fns";
import { Row, Col } from "antd";
import Chart from "react-google-charts";
import { useTranslation } from "react-i18next";

import LoadBox from "components/LoadBox";
import Empty from "components/Empty";
import Table, { NestedTableContainer } from "components/Table";
import { toDataSource } from "utils";

import { examRowClassName } from "./columns";

export default function ValuedExams({ record }) {
  const { t } = useTranslation();

  const expandedColumns = [
    {
      title: t("tableHeader.examHistory"),
      align: "left",
      key: "test",
      children: [
        {
          title: t("tableHeader.value"),
          align: "center",
          key: "key",
          render: (text, record) => {
            return `${record.value} ${record.unit}`;
          },
        },
        {
          title: t("tableHeader.date"),
          align: "center",
          key: "testdata",
          render: (text, record) => {
            return format(new Date(record.date), "dd/MM/yyyy HH:mm");
          },
        },
      ],
    },
  ];

  const history = record.history.map((item, index) => ({
    ...item,
    objKey: index,
  }));

  const dsHistory = toDataSource(history, "objKey");
  const graphDataArray = history.map((item) => {
    return [
      format(new Date(item.date), "dd/MM"),
      parseFloat(item.value, 10),
      item.max,
      item.min,
    ];
  });
  const dsGraph = [
    [
      t("tableHeader.date"),
      `${t("tableHeader.value")} ${history[0].unit}`,
      t("tableHeader.max"),
      t("tableHeader.min"),
    ],
  ].concat(graphDataArray.reverse());

  return (
    <NestedTableContainer>
      <Row gutter={8} justify="center">
        <Col md={12}>
          <Table
            columns={expandedColumns}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Nenhum exame encontrado."
                />
              ),
            }}
            dataSource={dsHistory}
            rowClassName={examRowClassName}
          />
        </Col>
        <Col md={12}>
          {dsGraph.length > 2 && (
            <Chart
              width="100%"
              height="400px"
              chartType="LineChart"
              loader={<LoadBox />}
              data={dsGraph}
              options={{
                hAxis: {
                  title: t("tableHeader.date"),
                },
                vAxis: {
                  title: t("tableHeader.value"),
                },
                backgroundColor: "transparent",
                series: {
                  1: { color: "#d9363e" },
                  2: { color: "#d9363e" },
                },
              }}
              rootProps={{ "data-testid": "1" }}
            />
          )}
        </Col>
      </Row>
    </NestedTableContainer>
  );
}
