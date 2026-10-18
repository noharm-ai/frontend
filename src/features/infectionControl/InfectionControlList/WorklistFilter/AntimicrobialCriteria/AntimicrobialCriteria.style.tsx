import styled from "styled-components";

// the antimicrobials asked for, one row each
export const Criteria = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Hint = styled.div`
  margin-bottom: 8px;
  font-size: 12px;
  opacity: 0.75;
`;

// the first and last treatment day, side by side
export const DayRange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
