import styled from "styled-components";
import { Select } from "antd";

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: rgb(169 145 214 / 12%);
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;

  &:hover {
    background-color: #fff;
    border-color: #d9d9d9;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

export const FieldSelect = styled(Select)`
  width: 200px;
  min-width: 200px;
`;

export const ValueContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
`;
