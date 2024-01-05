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

  .form-info {
    font-size: 13px;
    margin-left: 5px;
    margin-top: 3px;
    opacity: 0.8;
  }

  .form-input {
    .ant-select {
      width: 100%;
    }
  }

  .form-action {
    display: flex;
    justify-content: flex-end;
    margin: 5px 0;

    button {
      margin-left: 10px;
    }
  }

  .collapsed-content {
    .ant-collapse-header {
      padding-left: 0;
    }
  }
`;
