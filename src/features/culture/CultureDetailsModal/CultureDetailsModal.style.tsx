import styled from "styled-components";

import { get } from "styles/utils";
import { AWARE_COLORS } from "features/culture/awareLevel";
import {
  PREDICTED_RESISTANT,
  PREDICTED_SUSCEPTIBLE,
  PREDICTED_UNKNOWN,
  accentColor,
  type IAccentProps,
} from "features/culture/cultureColors";

// the details modal: a card per released antibiogram, and the pending
// collections summarised below them
export const Details = styled.div`
  .culture-prescribed-detail {
    margin-bottom: 10px;
    font-weight: 500;
  }

  /* the AWaRe group of the drug: the modal has the room the row had not, so
     an antimicrobial that was never classified is said to be so here */
  .culture-aware-detail {
    margin-bottom: 10px;
    font-weight: 500;

    .culture-aware-value-1 {
      color: ${AWARE_COLORS[1]};
    }

    .culture-aware-value-2 {
      color: ${AWARE_COLORS[2]};
    }

    .culture-aware-value-3 {
      color: ${AWARE_COLORS[3]};
    }

    .culture-aware-value-4 {
      color: ${AWARE_COLORS[4]};
    }

    .culture-aware-value-unknown {
      color: #6d7a94;
    }

    .culture-aware-hint {
      margin-top: 2px;
      font-size: 12px;
      font-weight: 400;
      color: #6d7a94;
    }
  }

  /* the collections are read side by side: a drug with several of them fits
     the modal instead of running past its bottom. Mirrors the row grid of
     List (CultureTab.style), including the minmax(0, …) a long microorganism name needs */
  .culture-detail-items {
    display: grid;
    grid-template-columns: 1fr;
    column-gap: 15px;
    row-gap: 10px;
    /* a released result is a third of the height of a pending one: without
       this the short block is stretched to the tall one beside it */
    align-items: start;
  }

  @media (min-width: ${get("breakpoints.md")}) {
    .culture-detail-items {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
  }

  /* a drug with a single collection fills the modal: the second track would
     only be whitespace beside it */
  .culture-detail-item:only-child {
    grid-column: 1 / -1;
  }

  /* the pending collections, summarised under the released results: a
     compact table instead of a card each, so the antibiograms are what the
     modal is read for */
  .culture-pending {
    margin-top: 15px;

    .culture-pending-title {
      margin-bottom: 6px;
      font-weight: 500;
      color: #6d7a94;

      .anticon {
        font-size: 12px;
      }
    }

    .culture-pending-list {
      border: 1px solid #e0e0e0;
      border-radius: 5px;
      overflow: hidden;
    }

    /* minmax(0, …): a long material name wraps instead of pushing the
       prediction out of the modal */
    .culture-pending-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 140px);
      column-gap: 12px;
      align-items: center;
      padding: 6px 10px;
      font-size: 13px;

      & + .culture-pending-row {
        border-top: 1px solid #f0f0f0;
      }
    }

    .culture-pending-header {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #6d7a94;
      background: #f7f7fb;

      .anticon {
        font-size: 12px;
      }
    }

    .pending-microorganism {
      display: block;
      font-size: 12px;
      color: #6d7a94;
    }

    .pending-date {
      color: #6d7a94;
      white-space: nowrap;
    }

    /* the prediction keeps the accent of what was predicted: the bar says it
       is an estimate, never the red or green of a released result */
    .culture-prediction {
      padding-left: 8px;
      border-left: 3px solid ${PREDICTED_UNKNOWN};

      &.culture-prediction-R {
        border-left-color: ${PREDICTED_RESISTANT};
      }

      &.culture-prediction-S {
        border-left-color: ${PREDICTED_SUSCEPTIBLE};
      }
    }

    .prediction-value {
      font-weight: 600;
    }

    .prediction-accuracy {
      font-size: 12px;
      color: #6d7a94;
    }

    .prediction-hint {
      margin-top: 6px;
      font-size: 12px;
      line-height: 1.4;
      color: #6d7a94;
    }
  }

  /* at phone width the date moves under the material, and the prediction
     keeps its column */
  @media (max-width: ${get("breakpoints.md")}) {
    .culture-pending .culture-pending-row {
      grid-template-columns: minmax(0, 1fr) minmax(0, 120px);
    }

    .culture-pending .pending-date {
      grid-column: 1;
      grid-row: 2;
      font-size: 12px;
    }

    .culture-pending .culture-pending-header .pending-date-header {
      display: none;
    }
  }
`;

// one collection inside the details modal. Side by side, a rule between the
// blocks no longer separates them: each carries its own frame, and the left
// bar states its result in the same colours the rows of the list use — a card
// is read on its own here, and a drug may hold a released antibiogram beside
// a pending collection that predicts the opposite
export const DetailItem = styled.div<IAccentProps>`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-left: 4px solid ${accentColor};
  border-radius: 5px;
`;
