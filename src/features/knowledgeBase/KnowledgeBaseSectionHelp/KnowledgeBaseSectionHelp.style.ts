import styled from "styled-components";

import Button from "components/Button";
import { get } from "styles/utils";

export const HelpIcon = styled(Button)<{ $empty?: boolean }>`
  vertical-align: middle;
  color: ${get("colors.primary")};
  // maintainers see the icon of an empty section too: keep it discreet
  opacity: ${({ $empty }) => ($empty ? 0.45 : 1)};
`;

export const ArticleList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 320px;

  li {
    margin-bottom: 4px;
  }

  .ant-btn-link {
    padding: 0;
    height: auto;
    white-space: normal;
    text-align: left;
  }

  li.create {
    margin-top: 8px;
  }
`;
