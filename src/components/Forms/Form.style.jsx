import styled from "styled-components";

import { get } from "styles/utils";

export const Footer = styled.div`
  border-top: 1px solid ${get("colors.detail")};
  margin-top: 20px;
  padding: 20px 10px;
  text-align: right;
  width: 720px;

  .ant-btn {
    margin-left: 15px;
  }
`;

export const FormContainer = styled.div`
  margin-top: 30px;
  padding: 0 15px;
`;

export const CustomFormContainer = styled.div`
  margin-top: 15px;
  padding: 0;

  .actions {
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid ${get("colors.detail")};
    margin-top: 20px;
    padding-top: 10px;

    button:not(:last-child) {
      margin-right: 10px;
    }

    &.horizontal {
      justify-content: flex-start;
    }
  }

  .question-group {
    margin-top: 15px;
  }

  .single-panel {
    background: #fff;
    padding: 0 1rem 1rem;
  }
`;

export const Box = styled.div`
  display: flex;
  flex-direction: ${(props) =>
    props.$flexDirection ? props.$flexDirection : "row"};
  flex-wrap: wrap;
  align-items: flex-start;
  width: ${(props) => (props.horizontal ? "auto" : "100%")};
  margin-right: ${(props) => (props.horizontal ? "30px" : "0")};

  label.fixed {
    width: 140px;
    margin-right: 10px;
  }

  input,
  .ant-select .ant-select-selector,
  textarea {
    background: ${(props) => (props.hasError ? "#ffcdd2;" : "inherit")};
  }

  .ant-select-selection__placeholder {
    color: ${(props) => (props.hasError ? "#454545;" : "inherit")};
  }

  &.highlight {
    input,
    .ant-select .ant-select-selector,
    textarea {
      background: #7ebe9a40;
    }
  }

  .label-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
`;

export const EditorBox = styled.div`
  .ck-content {
    min-height: 100px;
  }
`;

export const FieldError = styled.div`
  color: #f5222d;
  font-size: 13px;
  margin-left: 5px;
  margin-top: 3px;
`;

export const FieldHelp = styled.div`
  font-size: 12px;
  margin-top: 3px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

export const FormHeader = styled.div`
  border-top: 1px solid ${get("colors.detail")};
  border-bottom: 1px solid ${get("colors.detail")};
  padding: 10px 0;
  margin-bottom: 15px;
  width: 100%;
`;

export const InternalBox = styled.div`
  padding: 10px 50px;
  width: 100%;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 10px;
  margin-top: 5px;
  background: #fafafa;

  .ant-select,
  .ant-input {
    background: #fff;
  }
`;

export const ChoicePanel = styled.div`
  position: relative;
  background: #edebeb;
  padding: 15px;
  border-radius: 5px;

  .panel-title {
    font-weight: 500;
  }

  button {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

export const CheckboxContainer = styled.div`
  width: 100%;
  padding: 0 1rem;

  .checkbox-container__label {
    display: block;
    padding-bottom: 0.5rem;
  }

  .checkbox-container__item {
    border-bottom: 1px solid #e0e0e0;

    &:last-child {
      border-bottom: 0;
    }

    .ant-checkbox-wrapper {
      width: 100%;
      padding: 0.35rem;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(244, 244, 244, 0.8);
      }
    }
  }
`;

export const CheckboxDescription = styled.div`
  opacity: 0.7;
  padding-left: 24px;
  padding-top: 5px;
  line-height: 1.2;
  border-top: 1px solid #ccc;
`;
