import styled from "styled-components";

// same colors as MaintainerBadge
export const Group = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 4px 2px 8px;
  border: 1px dashed #b37feb;
  border-radius: 999px;
  background: #f9f0ff;

  .maintainer-lock {
    display: inline-flex;
    color: #531dab;
    font-size: 12px;
    cursor: help;
  }
`;
