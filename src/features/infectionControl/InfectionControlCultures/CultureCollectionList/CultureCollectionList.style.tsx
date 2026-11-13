import styled from "styled-components";

// the collections across the card's width, by day of collection. The rows
// (CultureCollectionRow) lay out by the width of the list, the container
export const CollectionList = styled.div`
  container-type: inline-size;

  .collections-toolbar {
    align-items: center;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    justify-content: space-between;
    padding: 8px 16px;
    position: sticky;
    top: 0;
    z-index: 2;

    .legend {
      padding: 0;
    }
  }

  .collections-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .collections-day {
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    color: #8c8c8c;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 4px 16px;
    text-transform: uppercase;
  }

  .collections-empty {
    padding: 24px 16px;
  }
`;
