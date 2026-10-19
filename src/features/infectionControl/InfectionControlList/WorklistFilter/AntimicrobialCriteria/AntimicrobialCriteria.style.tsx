import styled from "styled-components";

// the antimicrobials asked for, one row each, no wider than a row needs
export const Criteria = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 800px;
`;

// one antimicrobial asked for: what it is, its treatment days and removing
// it, wrapping on narrow screens; boxed, so a wrapped row still reads as one
export const Criterion = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
`;

// drug or substance, and the search of that type, below it on narrow screens
export const Search = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1 1 320px;
  min-width: 0;

  .ant-radio-group {
    flex: none;
  }

  > :last-child {
    flex: 1 1 200px;
    min-width: 0;
  }
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
  width: 220px;

  .ant-input-number {
    flex: 1;
    min-width: 0;
  }
`;
