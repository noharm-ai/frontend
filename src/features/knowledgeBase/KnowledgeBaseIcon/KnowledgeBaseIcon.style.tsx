import styled from "styled-components";

import Button from "components/Button";
import colors from "styles/colors";

// the shared Button widens every circle icon button to 32px
export const IconButton = styled(Button)`
  &&.ant-btn-circle.ant-btn-icon-only {
    width: 24px;
    min-width: 24px;
    height: 24px;
    vertical-align: middle;
    box-shadow: none;
  }
`;

export const PopoverBody = styled.div`
  width: 320px;
  max-width: calc(100vw - 48px);

  ul {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 320px;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
  }

  .kb-article {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    border-radius: 8px;
    background: none;
    text-align: left;
    cursor: pointer;

    strong {
      color: ${colors.primary};
      font-size: 13px;
      font-weight: 600;
    }

    span {
      display: -webkit-box;
      overflow: hidden;
      color: ${colors.text};
      font-size: 12px;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &:hover,
    &:focus-visible {
      background: rgba(0, 0, 0, 0.04);
      outline: none;
    }
  }

  .kb-empty {
    margin: 0;
    color: ${colors.text};
  }

  .kb-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid ${colors.detail};
  }

  .kb-help-mode {
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${colors.text};
    font-size: 13px;
    cursor: pointer;
  }
`;
