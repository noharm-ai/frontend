import styled from "styled-components";

import colors from "styles/colors";
import { get } from "styles/utils";
import { LoginContainer } from "components/Login/Login.style";

/* the login layout is one screen tall; a receipt is not */
export const PageContainer = styled(LoginContainer)`
  height: auto;
  min-height: 100vh;

  .form {
    padding-top: 32px;
    padding-bottom: 32px;
  }
`;

export const ValidationCard = styled.div`
  width: 100%;
  max-width: 600px;
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

  .what-to-do {
    margin: 8px 0 0;
    line-height: 1.5;
  }

  .saved {
    margin: 16px 0 0;
    color: ${colors.text};
    font-size: 0.9rem;
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
