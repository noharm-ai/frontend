import styled from "styled-components";

export const ReportsSection = styled.div`
  margin-top: 8px;
`;

export const ColumnBuilderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`;

export const ColumnBuilderHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  margin-bottom: 4px;

  span {
    font-size: 12px;
    font-weight: 500;
    opacity: 0.8;
  }
`;
