import React from "react";
import styled from "styled-components";

import Descriptions from "components/Descriptions";
import RichTextView from "components/RichTextView";

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
        <Descriptions.Item label="Responsável:" span={3}>
          <RichTextView text={record.partner_name} />
        </Descriptions.Item>
        <Descriptions.Item label="Descrição:" span={3}>
          <RichTextView text={record.description} />
        </Descriptions.Item>
      </Descriptions>
    </NestedTableContainer>
  );
};

export default expandedRowRender;
