import styled from "styled-components/macro";

export const Form = styled.form`
  .form-row {
    margin-top: 15px;

    &:first-child {
      margin-top: 0;
    }
  }

  .form-error {
    color: #f5222d;
    font-size: 13px;
    margin-left: 5px;
    margin-top: 3px;
  }

  .form-input {
    .ant-select {
      width: 100%;
    }
  }
`;
