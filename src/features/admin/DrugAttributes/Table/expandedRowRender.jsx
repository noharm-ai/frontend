import React from "react";
import styled from "styled-components";
import { Tag } from "antd";

import Descriptions from "components/Descriptions";
import NumericValue from "components/NumericValue";
import EditMaxDose from "./EditMaxDose";
import { formatDateTime } from "utils/date";
import EditSubstance from "./EditSubstance";

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
        <Descriptions.Item label="Medicamento:" span={3}>
          {record.name}
        </Descriptions.Item>
        <Descriptions.Item label="Substância:" span={3}>
          <EditSubstance
            idDrug={record.idDrug}
            sctid={record.sctid}
            accuracy={record.substanceAccuracy}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Dose máxima:" span={3}>
          <EditMaxDose
            idDrug={record.idDrug}
            idSegment={record.idSegment}
            maxDose={record.maxDose}
            useWeight={record.useWeight}
            measureUnitDefaultName={record.measureUnitDefaultName}
            record={record}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Custo:" span={3}>
          <NumericValue prefix={"R$ "} value={record.price} decimalScale={4} />/
          {!record.idMeasureUnitPrice ? (
            <Tag color="red">Unidade não definida</Tag>
          ) : (
            <>{record.idMeasureUnitPrice}</>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Última alteração" span={3}>
          {record.responsible && (
            <>
              {record.responsible} em {formatDateTime(record.updateAt)}
            </>
          )}
        </Descriptions.Item>
      </Descriptions>
    </NestedTableContainer>
  );
};

export default expandedRowRender;
