import styled from 'styled-components/macro';

import { get } from '@styles/utils';

export const Footer = styled.div`
  border-top: 1px solid ${get('colors.detail')};
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

export const Box = styled.div`
  display: flex;
  flex-direction: ${props => (props.flexDirection ? props.flexDirection : 'row')};
  flex-wrap: wrap;
  align-items: flex-start;
  width: 100%;

  label.fixed {
    width: 140px;
    margin-right: 10px;
  }

  input,
  .ant-select .ant-select-selection,
  textarea {
    background: ${props => (props.hasError ? '#ffcdd2;' : 'inherit')};
  }

  .ant-select-selection__placeholder {
    color: ${props => (props.hasError ? '#454545;' : 'inherit')};
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

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

export const FormHeader = styled.div`
  border-top: 1px solid ${get('colors.detail')};
  border-bottom: 1px solid ${get('colors.detail')};
  padding: 10px 0;
  margin-bottom: 15px;
`;

export const InternalBox = styled.div`
  padding: 10px 50px;
  width: 100%;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 10px;
  margin-top: 5px;
  background: #fafafa;

  .ant-select {
    background: #fff;
  }
`;
