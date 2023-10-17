import React from "react";
import styled from "styled-components/macro";

import Descriptions from "components/Descriptions";
import EditSubstance from "./EditSubstance";

const NestedTableContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 35px;

  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2e3c5a;
    width: 20%;
  }
`;

const expandedRowRender = (record) => {
  return (
    <NestedTableContainer>
      <Descriptions bordered size="small">
        <Descriptions.Item label="Medicamento:" span={3}>
          {record.name}
        </Descriptions.Item>
        <Descriptions.Item label="Substância:" span={3}>
          <EditSubstance idDrug={record.idDrug} sctid={record.sctid} />
        </Descriptions.Item>
      </Descriptions>
    </NestedTableContainer>
  );
};

export default expandedRowRender;
