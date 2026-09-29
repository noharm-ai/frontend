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

// the details modal: one block per collection, and a pending collection set
// apart from the result it has not got yet
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

  /* the result line of a pending collection says so instead of a result */
  .culture-result-pending .pending {
    font-weight: 500;
    color: #6d7a94;

    .anticon {
      font-size: 12px;
    }
  }

  /* the prediction is a box of its own, in the accent of what was predicted:
     it stands in for the result above it, and must not be read as it */
  .culture-prediction {
    margin-top: 8px;
    padding: 8px 10px;
    border-left: 3px solid ${PREDICTED_UNKNOWN};
    border-radius: 5px;
    background: #f7f7fb;

    .prediction-title {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #6d7a94;

      .anticon {
        font-size: 13px;
        color: ${PREDICTED_UNKNOWN};
      }
    }

    .prediction-value {
      margin-top: 4px;
      font-size: 14px;
      font-weight: 600;
      color: var(--nh-text-color);
    }

    .prediction-accuracy {
      font-size: 12px;
      font-weight: 400;
      color: #6d7a94;
    }

    .prediction-hint {
      margin-top: 4px;
      font-size: 12px;
      line-height: 1.4;
      color: #6d7a94;
    }

    &.culture-prediction-R {
      border-left-color: ${PREDICTED_RESISTANT};

      .prediction-title .anticon {
        color: ${PREDICTED_RESISTANT};
      }
    }

    &.culture-prediction-S {
      border-left-color: ${PREDICTED_SUSCEPTIBLE};

      .prediction-title .anticon {
        color: ${PREDICTED_SUSCEPTIBLE};
      }
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
