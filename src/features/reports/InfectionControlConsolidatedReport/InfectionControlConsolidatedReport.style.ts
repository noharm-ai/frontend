import styled from "styled-components";

/** A section of the report: its header, tiles and blocks, evenly apart. */
export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

/** Indicator tiles, as many per row as the width allows. */
export const IndicatorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;

  /* the loading wrapper (.ant-spin in antd 6) fills the row, so the tiles of
     a row end together */
  > .ant-spin,
  > .ant-spin > .ant-spin-container {
    height: 100%;
  }
`;

/**
 * A block fills its grid cell, so the blocks of a row end together. Only its
 * own loading wrapper stretches, not the ones of the tables inside it.
 */
export const BlockContainer = styled.div`
  height: 100%;

  > .ant-spin,
  > .ant-spin > .ant-spin-container,
  > .ant-spin > .ant-spin-container > div {
    height: 100%;
  }
`;

/** A short line under a block's title, such as a reference value. */
export const BlockHint = styled.div`
  text-align: center;
  color: #8c8c8c;
  font-size: 13px;
  margin-bottom: 8px;
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

/** The report's sections, one tab each; the tab bar stays off the print. */
export const ReportTabs = styled.div`
  margin-top: 24px;

  .ant-tabs-nav {
    margin-bottom: 24px;
  }

  /* the gap between blocks sets the spacing, not the section titles */
  h2 {
    margin-top: 0;
  }

  @media print {
    .ant-tabs-nav {
      display: none;
    }
  }
`;
