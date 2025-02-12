import React from "react";
import styled from "styled-components";
import { Alert } from "antd";

import Descriptions from "components/Descriptions";
import RichTextView from "components/RichTextView";

const NestedTableContainer = styled.div`
  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2e3c5a !important;
    width: 150px;
    text-align: right;
  }
`;

const expandedRowRender = (t) => (record) => {
  return (
    <NestedTableContainer>
      <Descriptions bordered size="small">
        <Descriptions.Item label="Origem:" span={3}>
          {record.originName}
        </Descriptions.Item>
        <Descriptions.Item label="Relacionada:" span={3}>
          {record.destinationName}
        </Descriptions.Item>
        <Descriptions.Item label="Tipo:" span={3}>
          {t(`drugAlertType.${record.kind}`)}
        </Descriptions.Item>
        <Descriptions.Item label="Efeito:" span={3}>
          <div style={{ maxWidth: "500px" }}>
            <Alert
              type="error"
              message={<RichTextView text={record.text} />}
              showIcon
            ></Alert>
          </div>
        </Descriptions.Item>
      </Descriptions>
    </NestedTableContainer>
  );
};

export default expandedRowRender;
