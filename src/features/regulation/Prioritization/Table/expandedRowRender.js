import React from "react";
import styled from "styled-components/macro";

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
  return (
    <NestedTableContainer>
      <Descriptions bordered size="small"></Descriptions>
    </NestedTableContainer>
  );
};

export default expandedRowRender;
