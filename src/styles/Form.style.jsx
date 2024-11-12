import styled from "styled-components/macro";

export const Form = styled.form`
  &.highlight-labels {
    .form-label {
      label {
        font-weight: 500;
      }
    }
  }

  .form-label {
    label {
      color: #2e3c5a;
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

  .form-readonly {
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .form-input {
    .ant-select {
      width: 100%;
    }

    .success {
      input {
        background: #f6ffed;
      }

      .ant-select-selector {
        background: #f6ffed !important;
      }
    }

    .error {
      input {
        background: #fff2f0;
      }
    }

    .warning {
      input {
        background: #fffbe6;
      }

      &.ant-input {
        background: #fffbe6;
      }

      .ant-select-selector {
        background: #fffbe6 !important;
      }

      .ant-input-number-group-addon {
        background: #fffbe6;
      }

      .ant-input-number-input-wrap {
        background: #fffbe6;
        border-radius: 5px;
      }
    }

    .ant-space {
      width: 100%;

      > div:first-child {
        flex: 1;
      }
    }

    .ant-input-number-group-wrapper {
      width: 100%;
    }

    .ck-editor__editable {
      max-height: 200px;

      .ck-placeholder {
        opacity: 0.6;
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

  .form-input-checkbox-single {
    padding: 1rem;
    background: #fafafa;
    border-radius: 5px;

    .checkbox-description {
      padding-left: 1.5rem;
      opacity: 0.75;
      line-height: 1.2;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #ccc;
      margin-bottom: 0.5rem;
      font-size: 13px;
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

  .inner-section {
    padding: 0.5rem 1rem;
  }
`;
