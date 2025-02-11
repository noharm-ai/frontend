import React from "react";
import styled from "styled-components";

import Descriptions from "components/Descriptions";

const NestedTableContainer = styled.div`
  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2e3c5a !important;
    width: 20%;
    text-align: right;
  }
`;

const expandedRowRender = (record) => {
  const items = [
    {
      key: "1",
      label: "Protocolo",
      children: record.id,
      span: 3,
    },
    {
      key: "2",
      label: "UBS",
      children: record.department,
      span: 3,
    },
  ];
  return (
    <NestedTableContainer>
      <Descriptions bordered size="small" items={items}></Descriptions>
    </NestedTableContainer>
  );
};

export default expandedRowRender;
