import styled from "styled-components/macro";

export const Form = styled.form`
  &.highlight-labels {
    .form-label {
      label {
        font-weight: 500;
      }
    }
  }

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

    ul {
      padding: 0;

      li {
        list-style-type: none;
      }
    }
  }

  .form-input {
    .ant-select {
      width: 100%;
    }

    .success {
      input {
        background: #f6ffed;
      }
    }

    .error {
      input {
        background: #fff2f0;
      }
    }
  }

  .form-input-checkbox {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 1rem;
    background: #fafafa;
    border-radius: 5px;
  }

  .form-action {
    display: flex;
    justify-content: flex-end;
    margin: 5px 0;

    button {
      margin-left: 10px;
    }
  }

  .form-action-bottom {
    display: flex;
    justify-content: flex-end;
    margin: 5px 0;
    border-top: 1px solid rgb(240, 240, 240);
    padding-top: 15px;

    button {
      margin-left: 10px;
    }
  }

  .collapsed-content {
    .ant-collapse-header {
      padding-left: 0;
    }
  }

  .form-intro {
    font-size: 1rem;
    margin-bottom: 30px;

    p:first-child {
      margin-top: 0;
    }
  }
`;
