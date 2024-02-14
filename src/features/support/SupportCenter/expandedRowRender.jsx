import React from "react";
import styled from "styled-components/macro";
import DOMPurify from "dompurify";

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
      <Descriptions bordered size="small">
        <Descriptions.Item label="Descrição:" span={3}>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(record.description),
            }}
          />
        </Descriptions.Item>
      </Descriptions>
    </NestedTableContainer>
  );
};

export default expandedRowRender;
