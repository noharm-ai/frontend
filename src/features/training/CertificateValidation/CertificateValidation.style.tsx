import styled from "styled-components";

import colors from "styles/colors";
import { get } from "styles/utils";

export const ValidationCard = styled.div`
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 32px;
  box-sizing: border-box;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);

  @media (max-width: ${get("breakpoints.sm")}) {
    padding: 24px 20px;
  }

  h1 {
    margin: 0 0 6px;
    color: ${colors.primary};
    font-size: 1.5rem;
    font-weight: 600;
  }

  .subtitle {
    margin: 0 0 24px;
    color: ${colors.text};
    font-size: 0.95rem;
  }

  .field-error {
    display: block;
    margin: 6px 0 0;
    color: ${colors.danger};
    font-size: 0.85rem;
  }

  .actions {
    margin-top: 16px;
  }

  /* the typed code is the thing being compared against paper, so give it room
     to breathe and never let the browser fold the case */
  input.code-input {
    text-transform: uppercase;
    letter-spacing: 3px;
    font-size: 1.1rem;
    text-align: center;
  }
`;

/* the modal title carries the valid/invalid signal, so the body stays plain */
export const ResultTitle = styled.span<{ $valid: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${(props) => (props.$valid ? colors.accent : colors.danger)};
`;

export const ValidationResult = styled.div`
  .result-subtitle {
    margin: 0 0 16px;
    color: ${colors.text};
    font-size: 0.9rem;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 16px;
    margin: 0;
  }

  dt {
    color: ${colors.text};
    font-size: 0.85rem;
    white-space: nowrap;
  }

  dd {
    margin: 0;
    color: ${colors.primary};
    font-weight: 500;
    word-break: break-word;
  }

  .lessons {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  .lessons-title {
    margin: 0 0 8px;
    color: ${colors.text};
    font-size: 0.85rem;
  }

  .lessons ol {
    margin: 0;
    padding-left: 20px;
    color: ${colors.primary};
  }

  .lessons li {
    margin-bottom: 4px;
    font-weight: 500;
    line-height: 1.4;
  }

  .masked-hint {
    margin: 20px 0 0;
    color: ${colors.text};
    font-size: 0.8rem;
    line-height: 1.4;
  }
`;
