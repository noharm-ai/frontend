import styled from "styled-components";

import colors from "styles/colors";

import { helpModeTint } from "../helpModeColors";

export const ListHint = styled.p`
  margin: 0 0 12px;
  color: ${colors.text};
  font-size: 13px;
`;

export const ArticleList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 60vh;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;

  button {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid ${colors.detail};
    border-radius: 8px;
    background: none;
    text-align: left;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: ${helpModeTint(0.16)};
      outline: none;
    }
  }

  strong {
    color: ${colors.primary};
    font-size: 14px;
    font-weight: 600;
  }

  span {
    display: -webkit-box;
    overflow: hidden;
    color: ${colors.text};
    font-size: 13px;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  small {
    color: ${colors.text};
    font-size: 12px;
    opacity: 0.8;
  }
`;
