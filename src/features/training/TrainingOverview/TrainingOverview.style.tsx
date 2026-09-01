import styled from "styled-components";

import colors from "styles/colors";

export const SummaryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
`;

export const SummaryCard = styled.div<{ $alert?: boolean }>`
  flex: 1;
  min-width: 160px;
  padding: 16px 20px;
  border-radius: 8px;
  background: ${colors.commonLighter};
  border: 1px solid ${(props) => (props.$alert ? colors.danger : colors.detail)};

  .summary-value {
    display: block;
    color: ${(props) => (props.$alert ? colors.danger : colors.primary)};
    font-size: 1.75rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .summary-label {
    display: block;
    color: ${colors.text};
    font-size: 0.8rem;
    margin-top: 4px;
  }
`;

export const ModuleProgressPanel = styled.div`
  padding: 20px;
  border-radius: 8px;
  background: ${colors.commonLighter};
  border: 1px solid ${colors.detail};
  margin-bottom: 20px;

  h3 {
    color: ${colors.primary};
    font-size: 1rem;
    margin: 0 0 16px 0;
  }
`;

export const ModuleProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 8px 0;

  & + & {
    border-top: 1px solid ${colors.detail};
  }

  .module-name {
    flex: 1;
    min-width: 0;
    color: ${colors.primary};
    font-size: 0.875rem;
  }

  .module-bar {
    width: 180px;
    flex-shrink: 0;
  }

  .module-count {
    width: 130px;
    flex-shrink: 0;
    text-align: right;
    color: ${colors.text};
    font-size: 0.8rem;
  }
`;

export const UserCell = styled.div`
  text-align: left;

  strong {
    display: block;
    color: ${colors.primary};
    font-weight: 600;
  }

  span {
    display: block;
    color: ${colors.text};
    font-size: 0.75rem;
  }
`;

/* the expanded row: one line per module for a single user */
export const UserModuleList = styled.div`
  padding: 10px 15px;

  .user-module-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
    font-size: 0.8rem;
  }

  .user-module-row + .user-module-row {
    border-top: 1px solid ${colors.detail};
  }

  .user-module-title {
    flex: 1;
    min-width: 0;
    color: ${colors.primary};
  }

  .user-module-lessons {
    width: 90px;
    flex-shrink: 0;
    text-align: right;
    color: ${colors.text};
  }

  .user-module-date {
    width: 150px;
    flex-shrink: 0;
    text-align: right;
    color: ${colors.text};
  }

  .user-module-status {
    width: 130px;
    flex-shrink: 0;
    text-align: right;
  }
`;

export const MandatoryCount = styled.span<{ $pending: boolean }>`
  color: ${(props) => (props.$pending ? colors.danger : colors.primary)};
  font-weight: ${(props) => (props.$pending ? 600 : 400)};
`;
