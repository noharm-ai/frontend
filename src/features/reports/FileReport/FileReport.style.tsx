import styled from "styled-components";
import { Card } from "antd";

export const FilterContainer = styled(Card)`
  border-radius: 10px;
  box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);
  margin-bottom: 1rem;

  .ant-card-body {
    padding: 1rem;
  }
`;

export const FilterActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  border-top: 1px solid #f0f0f0;
  padding-top: 0.5rem;
  gap: 8px;

  h3 {
    margin: 0;
    color: #2e3c5a;
    font-weight: 600;
  }
`;

export const FilterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
