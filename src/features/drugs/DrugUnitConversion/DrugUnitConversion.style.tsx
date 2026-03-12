import styled from "styled-components";
import { InputNumber } from "components/Inputs";

export const LargeInputNumber = styled(InputNumber)<{ $invalid?: boolean }>`
  input {
    font-size: 20px !important;
    font-weight: 700;
    color: ${({ $invalid }) =>
      $invalid ? "var(--ant-color-error, #ff4d4f)" : "#15803d"} !important;
    text-align: center;
    padding: 0 4px;
  }
  .ant-input-number-handler-wrap {
    display: none;
  }
`;

export const DefaultUnitCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--ant-color-success-bg, #f6ffed);
  border: 1px solid var(--ant-color-success-border, #b7eb8f);
  border-radius: 8px;
  margin-bottom: 16px;
`;

export const DefaultUnitInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 13px;
`;

export const DefaultUnitBadge = styled.span`
  background: #15803d;
  color: #fff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const ConversionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

export const ConversionCard = styled.div<{ $invalid?: boolean }>`
  padding: 16px;
  border: 1px solid
    ${({ $invalid }) =>
      $invalid
        ? "var(--ant-color-error, #ff4d4f)"
        : "var(--ant-color-border, #d9d9d9)"};
  border-radius: 12px;
  background: ${({ $invalid }) =>
    $invalid
      ? "var(--ant-color-error-bg, #fff2f0)"
      : "var(--ant-color-fill-quaternary, #fafafa)"};
`;

export const ConversionBadgesRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const SourceUnitBadge = styled.span`
  background: var(--ant-color-fill-secondary, #e8e8e8);
  border: 1px solid var(--ant-color-border);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const ArrowSeparator = styled.span`
  color: var(--ant-color-text-quaternary, #bfbfbf);
`;

export const TargetUnitBadge = styled.span`
  background: var(--ant-color-success-bg);
  border: 1px solid var(--ant-color-success-border);
  color: #15803d;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const ValuesRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
`;

export const ValueNumber = styled.span`
  font-weight: 700;
  font-size: 20px;
`;

export const EqualSign = styled.span`
  font-size: 20px;
  color: var(--ant-color-text-secondary);
`;

export const ConversionDescription = styled.div`
  font-size: 13px;
  color: var(--ant-color-text-primary);
  margin-bottom: 4px;
`;

export const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const LoadingContainer = styled.div`
  padding: 32px 0;
  text-align: center;
`;

export const EmptyMessage = styled.div`
  text-align: center;
  color: var(--ant-color-text-secondary);
  padding: 16px 0;
`;
