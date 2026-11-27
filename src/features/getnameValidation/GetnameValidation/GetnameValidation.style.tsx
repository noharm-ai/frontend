import styled from "styled-components";

import colors from "styles/colors";
import { get } from "styles/utils";
import { Brand as LoginBrand } from "components/Login/Login.style";

/* a page of its own, centered: the login layout keeps its form to one side
   and is one screen tall, and a receipt is neither */
export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 48px 16px;
  box-sizing: border-box;
  background: #f5f7fa;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;

  @media (max-width: ${get("breakpoints.sm")}) {
    padding: 24px 12px;
  }
`;

/* the login's logo, with the room a page that scrolls can spare */
export const Brand = styled(LoginBrand)`
  && {
    width: 13em;
    margin: 0 auto 32px;
  }
`;

export const ValidationCard = styled.div`
  width: 100%;
  max-width: 640px;
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
    margin: 0 0 20px;
    color: ${colors.text};
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .target {
    margin: 0 0 20px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 16px;

    dt {
      color: ${colors.text};
      font-size: 0.85rem;
      white-space: nowrap;
    }

    dd {
      margin: 0;
      color: ${colors.primary};
      font-weight: 500;
      word-break: break-all;
    }
  }

  .notice {
    margin-bottom: 16px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;
  }

  .saved {
    margin: 16px 0 0;
    color: ${colors.text};
    font-size: 0.9rem;
  }
`;

/* what to do about a verdict: who acts, in what order */
export const Resolution = styled.div`
  margin-top: 12px;
  line-height: 1.5;

  .owner {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: ${colors.text};
    font-size: 0.85rem;
  }

  .owner-notice {
    margin: 0 0 8px;
  }

  ol {
    margin: 0 0 8px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
  }

  .resolution-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
`;

/* the two clicks that find why a connection failed */
export const Guide = styled.div`
  margin-top: 12px;

  .guide-step {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 12px 0 8px;
    color: ${colors.primary};
    font-weight: 500;
  }

  .guide-number {
    flex: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${colors.primary};
    color: #fff;
    font-size: 0.8rem;
    line-height: 22px;
    text-align: center;
  }

  .guide-options {
    display: grid;
    gap: 8px;
  }

  .guide-option {
    display: block;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid ${colors.detail};
    border-radius: 8px;
    background: #fff;
    text-align: left;
    cursor: pointer;
    font: inherit;
    transition: border-color 0.2s;

    &:hover:not(:disabled),
    &:focus-visible {
      border-color: ${colors.accentSecondary};
      outline: none;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .guide-option-label {
    display: block;
    color: ${colors.primary};
    font-weight: 500;
  }

  .guide-option-hint {
    display: block;
    color: ${colors.text};
    font-size: 0.8rem;
  }

  .guide-note {
    margin: 8px 0 0;
    color: ${colors.text};
    font-size: 0.8rem;
  }
`;

export const CheckList = styled.ol`
  list-style: none;
  margin: 20px 0 0;
  padding: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);

  li {
    display: grid;
    grid-template-columns: 22px 1fr auto;
    align-items: start;
    gap: 2px 10px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .check-label {
    color: ${colors.primary};
    font-weight: 500;
  }

  .check-message {
    grid-column: 2 / 4;
    color: ${colors.text};
    font-size: 0.85rem;
    word-break: break-word;
  }

  .check-time {
    color: ${colors.text};
    font-size: 0.8rem;
    white-space: nowrap;
  }
`;

const STATUS_COLORS: Record<string, string> = {
  passed: "#52c41a",
  failed: colors.danger,
  warning: "#faad14",
  skipped: colors.fifth,
  running: colors.accentSecondary,
  pending: colors.fifth,
};

export const CheckIcon = styled.span<{ $status: string }>`
  color: ${(props) => STATUS_COLORS[props.$status] ?? colors.fifth};
  font-size: 1.1rem;
  line-height: 1.4;
`;
