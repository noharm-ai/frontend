import styled from "styled-components/macro";

import { get } from "styles/utils";

export const Footer = styled.div`
  border-top: 1px solid ${get("colors.detail")};
  margin-top: 20px;
  padding: 20px 10px;
  text-align: right;
  width: 100%;

  .ant-btn {
    margin-left: 15px;
  }
`;

export const FormContainer = styled.div`
  margin-top: 30px;
  padding: 0 15px;
`;

export const Box = styled.div`
  display: flex;
  align-items: center;

  label.fixed {
    width: 140px;
    margin-right: 10px;
  }

  input,
  .ant-select .ant-select-selection {
    background: ${(props) => (props.hasError ? "#ffcdd2;" : "inherit")};
  }
`;

export const FieldError = styled.div`
  margin-left: 150px;
  margin-top: 10px;
  color: #f5222d;
`;
