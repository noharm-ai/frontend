import styled from "styled-components";

/** Indicator tiles, as many per row as the width allows. */
export const IndicatorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`;

/** A titled block (chart or table) with the help icon beside its title. */
export const BlockTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 8px;
`;

/** The day picker beside the day view's section title. */
export const DayHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;

  .day-picker {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;
