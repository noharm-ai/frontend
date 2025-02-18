import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { Row, Col } from "antd";
import { useTranslation } from "react-i18next";

import Card from "components/Card";
import Icon from "components/Icon";
import Empty from "components/Empty";
import Table, { NestedTableContainer } from "components/Table";
import { toDataSource } from "utils";

export const PaperContainer = styled.div`
  position: relative;
  padding: 5px;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  max-width: 640px;
  min-height: 300px;
  width: 100%;
  margin-bottom: 15px;
  margin-left: 30px;

  @media only screen and (min-width: 1400px) {
    max-width: 720px;
  }
`;

export const Paper = styled.div`
  position: relative;
  padding: 25px 25px;
  max-height: 80vh;
  width: 100%;
  font-size: 18px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(143, 148, 153, 0.8) #ffffff;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #fff;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(143, 148, 153, 0.8);
  }
`;

export default function TextualExams({ record }) {
  const [selected, select] = useState({});
  const { t } = useTranslation();

  const expandedColumns = [
    {
      title: t("tableHeader.examHistory"),
      align: "center",
      key: "testdata",
      render: (_, record) => {
        return format(new Date(record.date), "dd/MM/yyyy HH:mm");
      },
    },
    {
      title: "",
      align: "right",
      render: () => {
        return <Icon type="right" style={{ fontSize: 16 }} />;
      },
    },
  ];

  useEffect(() => {
    select(record.history[0]);
  }, [record.history]);

  const history = record.history.map((item, index) => ({
    ...item,
    objKey: index,
  }));
  const dsHistory = toDataSource(history, "objKey");

  const rowClassName = (record) => {
    if (record.date === selected.date) {
      return "selectable active";
    }

    return "selectable";
  };

  return (
    <NestedTableContainer>
      <Card>
        <Row gutter={8} type="flex" justify="center">
          <Col md={6} style={{ display: "flex", justifyContent: "flex-end" }}>
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
              rowClassName={rowClassName}
              onRow={(r) => ({
                onClick: () => {
                  select(r);
                },
              })}
            />
          </Col>
          <Col md={18} style={{ display: "flex", paddingTop: "32px" }}>
            <PaperContainer>
              <Paper
                dangerouslySetInnerHTML={{
                  __html: selected.value,
                }}
              />
            </PaperContainer>
          </Col>
        </Row>
      </Card>
    </NestedTableContainer>
  );
}
