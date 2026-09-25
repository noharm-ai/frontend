import styled from "styled-components";

import { get } from "styles/utils";

export const ArticleContent = styled.div`
  line-height: 1.6;

  p {
    margin: 0 0 0.75rem;
  }

  ul,
  ol {
    padding-left: 20px;
    margin: 0 0 0.75rem;
  }

  a {
    color: ${get("colors.primary")};
  }
`;

export const ArticleBody = styled.div`
  max-height: 68vh;
  overflow-y: auto;
`;
