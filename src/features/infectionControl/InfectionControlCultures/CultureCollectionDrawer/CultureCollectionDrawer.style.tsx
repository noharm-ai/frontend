import styled from "styled-components";

// the collection whole: each culture a block of its own, its dates and the
// lab's words on top of its antibiogram
export const DrawerBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  .collection-culture {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
  }

  .collection-culture-head {
    align-items: center;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 8px 8px 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    justify-content: space-between;
    padding: 8px 14px;
  }

  .collection-culture-name {
    color: #262626;
    font-size: 13px;
    font-weight: 600;
  }

  .collection-culture-release {
    color: #595959;
    font-size: 12.5px;
    font-variant-numeric: tabular-nums;
  }

  .collection-culture-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 10px 14px 14px;
  }

  .collection-facts {
    display: grid;
    gap: 6px 16px;
    grid-template-columns: max-content minmax(0, 1fr);
    margin: 0;

    dt {
      color: #8c8c8c;
      font-size: 12.5px;
      padding-top: 1px;
    }

    dd {
      margin: 0;
      min-width: 0;
      overflow-wrap: anywhere;
    }
  }

  .culture-microorganism {
    color: #2e3c5a;
    font-style: italic;
    font-weight: 600;
  }

  .muted {
    color: #8c8c8c;
  }
`;

// the header of the drawer: the exam on top of its material and dates
export const DrawerTitle = styled.div`
  .drawer-exam {
    color: #262626;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
  }

  .drawer-material {
    color: #595959;
    font-weight: 400;
  }

  .drawer-collected {
    color: #8c8c8c;
    font-size: 12.5px;
    font-variant-numeric: tabular-nums;
    font-weight: 400;
  }
`;

// the other collections of the list, without closing the drawer
export const DrawerNav = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;

  .drawer-position {
    color: #8c8c8c;
    font-size: 12.5px;
    font-variant-numeric: tabular-nums;
  }
`;
