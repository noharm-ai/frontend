import styled, { createGlobalStyle, css, keyframes } from "styled-components";

/** Accent used by every training-mode visual (banner, frame, highlights). */
export const TRAINING_COLOR = "#7b1fa2";

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(123, 31, 162, 0.6);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(123, 31, 162, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(123, 31, 162, 0);
  }
`;

/** Fixed viewport border so training mode is unmistakable on any scroll position. */
export const TrainingFrame = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  border: 4px solid ${TRAINING_COLOR};
  z-index: 1090;
`;

/** Pulsing outline applied to the active step's target element. */
export const TrainingHighlightStyle = createGlobalStyle`
  .training-highlight {
    border-radius: 4px;
    outline: 2px solid ${TRAINING_COLOR};
    outline-offset: 2px;
    ${css`
      animation: ${pulse} 1.6s ease-out infinite;
    `}
  }
`;
