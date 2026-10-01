import styled from "styled-components";

import colors from "styles/colors";

export const ElementCode = styled.code`
  display: block;
  padding: 6px 10px;
  overflow-x: auto;
  border-radius: 6px;
  background: rgba(46, 60, 90, 0.06);
  color: ${colors.primary};
  font-size: 12px;
  white-space: nowrap;
`;

export const ArticleList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 0 8px;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 4px 4px 10px;
    border: 1px solid ${colors.detail};
    border-radius: 6px;
    color: ${colors.primary};
    font-size: 13px;
  }
`;
