import React from "react";
import styled from "styled-components/macro";

import Descriptions from "components/Descriptions";
import RichTextView from "components/RichTextView";

const NestedTableContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 35px;

  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2e3c5a;
    width: 20%;
  }
`;

const expandedRowRender = (bag) => (record) => {
  return (
    <NestedTableContainer>
      <Descriptions bordered size="small">
        <Descriptions.Item label={bag.t("tableHeader.observation")} span={3}>
          <RichTextView text={record.recommendation} />
        </Descriptions.Item>
      </Descriptions>
    </NestedTableContainer>
  );
};

export default expandedRowRender;
