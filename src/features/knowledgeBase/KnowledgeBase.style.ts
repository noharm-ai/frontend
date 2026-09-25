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

export const ArticleLessons = styled.div`
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;

  h4 {
    margin: 0 0 0.5rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ant-btn-link {
    padding: 0;
    height: auto;
    white-space: normal;
    text-align: left;
  }
`;
