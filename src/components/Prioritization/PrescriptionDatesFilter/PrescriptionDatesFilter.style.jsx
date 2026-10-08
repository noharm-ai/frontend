import styled from "styled-components";

import { get } from "styles/utils";

export const PrescriptionDatesFilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  .prescription-dates-label {
    font-weight: 500;
    color: ${get("colors.text")};
  }

  .prescription-dates-time {
    min-width: 40px;
    font-weight: 600;
  }

  /* the slider reads as a timeline: what lies before the pointer is hidden
     (hatched, grey) and what lies after it is shown (colored) */
  && .ant-slider {
    width: 150px;
    margin: 0;

    .ant-slider-rail,
    &:hover .ant-slider-rail {
      background: ${get("colors.accentSecondary")};
    }

    .ant-slider-track,
    &:hover .ant-slider-track {
      background: repeating-linear-gradient(
        -45deg,
        #bfbfbf,
        #bfbfbf 3px,
        #e8e8e8 3px,
        #e8e8e8 6px
      );
    }
  }

  .prescription-dates-hidden {
    margin: 0;
    cursor: help;
  }

  .prescription-dates-show-all {
    padding: 0;
  }
`;
