import styled from "styled-components";

import { CollectionRow } from "../CultureCollectionRow/CultureCollectionRow.style";
import { FILTER_TEAL as TEAL } from "../filterTeal";

// the collections across the card's width, by day of collection. The rows
// (CultureCollectionRow) lay out by the width of the list, the container. The
// report prints them in one too, the day left in the flow (.printed).
// The toolbar and the day of the collections in sight stay at the top of the
// card as it scrolls: the day under the toolbar, whose height (it wraps) is
// measured into --toolbar-height
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
    z-index: 3;

    .legend {
      padding: 0;
    }
  }

  /* the filters in use: the button turns teal */
  .details-active {
    border-color: ${TEAL};
    color: ${TEAL};
  }

  .collections-day {
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    color: #8c8c8c;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 4px 16px;
    position: sticky;
    text-transform: uppercase;
    top: var(--toolbar-height, 0px);
    z-index: 2;
  }

  /* on paper: nothing sticks, a day stays with its first collection, a
     collection is not split across pages, and the lab's text and the names
     are printed whole, with nowhere to open them */
  &.printed {
    /* the rows size their secondary text in px: the report's smaller print
       font would leave the exam and microorganism under it */
    font-size: 13px;

    .collections-day {
      break-after: avoid;
      position: static;
    }

    ${CollectionRow} {
      break-inside: avoid;
    }

    .clamp {
      display: inline-block;
      -webkit-line-clamp: none;
      overflow: visible;
    }

    .organism-name {
      overflow: visible;
      white-space: normal;
    }
  }

  .collections-empty {
    padding: 24px 16px;
  }
`;
