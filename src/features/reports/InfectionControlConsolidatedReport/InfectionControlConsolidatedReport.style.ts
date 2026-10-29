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
  margin-top: 16px;

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

const ACTIVE_TAB = "#1565c0";

/**
 * The tab bar as a row of buttons, the open one filled, stuck to the top of
 * the page on scroll. Sticky, not antd's Affix: the Tabs styles reach the bar
 * through one wrapper only, and Affix adds two.
 */
export const TabBar = styled.div`
  position: sticky;
  /* 1px above the page once stuck, which tells the page it is stuck */
  top: -1px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 24px;
  /* the page's background, so the content scrolls under it */
  background: #eff1f4;
  padding: 8px 0;
  margin-bottom: 24px;
  transition:
    background 0.2s,
    padding 0.2s;

  .tab-bar-title {
    display: none;
    font-size: 16px;
    font-weight: 600;
    color: #2e3c5a;
    white-space: nowrap;
  }

  /* && over antd's bottom margin on the bar */
  && .ant-tabs-nav {
    flex: 1;
    min-width: 0;
    margin: 0;
  }

  /* stuck: a see-through white bar over the content, with the page title and
     smaller buttons */
  &.stuck {
    background: rgb(255 255 255 / 85%);
    backdrop-filter: blur(8px);
    padding: 7px 16px 6px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 8%);

    .tab-bar-title {
      display: block;
    }

    .ant-tabs-tab {
      padding: 4px 12px;
      font-size: 13px;
    }

    .ant-tabs-nav-list {
      gap: 8px;
    }
  }

  /* no underline nor ink bar: the buttons show the open tab */
  .ant-tabs-nav::before,
  .ant-tabs-ink-bar {
    display: none;
  }

  /* the buttons share the bar's width evenly (beside the title, once stuck);
     never narrower than their label, so a narrow screen gets antd's overflow
     menu */
  .ant-tabs-nav-list {
    flex: 1;
    gap: 12px;
  }

  .ant-tabs-tab {
    flex: 1 1 0;
    justify-content: center;
    margin: 0;
    padding: 8px 16px;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgb(0 0 0 / 6%);
    transition:
      border-color 0.2s,
      background 0.2s;

    &:hover {
      border-color: ${ACTIVE_TAB};

      .ant-tabs-tab-btn {
        color: ${ACTIVE_TAB};
      }
    }
  }

  .ant-tabs-tab + .ant-tabs-tab {
    margin: 0;
  }

  .ant-tabs-tab-btn {
    color: rgb(0 0 0 / 88%);
    font-weight: 500;
  }

  .ant-tabs-tab.ant-tabs-tab-active {
    background: ${ACTIVE_TAB};
    border-color: ${ACTIVE_TAB};

    .ant-tabs-tab-btn,
    &:hover .ant-tabs-tab-btn {
      color: #fff;
      font-weight: 600;
    }
  }

  @media print {
    display: none;
  }
`;
