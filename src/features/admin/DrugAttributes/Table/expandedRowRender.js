import React from "react";
import styled from "styled-components/macro";

import Descriptions from "components/Descriptions";
import NumericValue from "components/NumericValue";
import EditSubstance from "./EditSubstance";

const NestedTableContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  background: rgb(169 145 214 / 16%);

  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2e3c5a !important;
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
        <Descriptions.Item label="Custo:" span={3}>
          <NumericValue prefix={"R$ "} value={record.price} decimalScale={4} />
        </Descriptions.Item>
      </Descriptions>
    </NestedTableContainer>
  );
};

export default expandedRowRender;
