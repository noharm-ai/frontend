import React from "react";
import { format } from "date-fns";
import { Row, Col } from "antd";
import { useTranslation } from "react-i18next";

import NumericValue from "components/NumericValue";
import Empty from "components/Empty";
import Table, { NestedTableContainer } from "components/Table";
import { toDataSource } from "utils";
import { ExamChart } from "./ExamChart";

import { examRowClassName } from "./columns";
import { formatDate } from "utils/date";

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
            return (
              <NumericValue
                suffix={record.unit ? ` ${record.unit}` : ""}
                value={record.value}
              />
            );
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
  const reportData = {
    days: [],
    min: [],
    max: [],
    results: [],
    unit: `${t("tableHeader.value")} ${history[0].unit}`,
  };
  [...history].reverse().forEach((item) => {
    reportData.days.push(formatDate(item.date, "DD/MM"));
    reportData.min.push(item.min);
    reportData.max.push(item.max);
    reportData.results.push(parseFloat(item.value, 10));
  });

  return (
    <NestedTableContainer>
      <Row gutter={8} justify="center">
        <Col xs={24} lg={12}>
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
        <Col xs={24} lg={12}>
          {reportData.days.length > 1 && (
            <ExamChart isLoading={false} reportData={reportData} />
          )}
        </Col>
      </Row>
    </NestedTableContainer>
  );
}
