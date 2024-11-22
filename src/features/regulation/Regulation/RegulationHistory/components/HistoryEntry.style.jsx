import styled from "styled-components/macro";
import { timingFunctions } from "polished";

export const HistoryEntryContainer = styled.div`
  position: relative;
  .he-date {
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .he-stage {
    font-size: 1rem;
    font-weight: 500;
  }

  .he-details {
    font-weight: 300;
  }

  .he-buttons {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ${timingFunctions("easeOutQuint")};
  }

  &:hover {
    .he-buttons {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;
