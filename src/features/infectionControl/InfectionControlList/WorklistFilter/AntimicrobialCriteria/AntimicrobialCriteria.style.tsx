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

// whether the patient meets any row or every row
export const Match = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

// the first and last treatment day, side by side
export const DayRange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
