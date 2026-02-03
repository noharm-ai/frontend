import styled from "styled-components";

export default styled.div`
  .block-img {
    text-align: center;

    img {
      max-width: 100%;
    }
  }

  .embed {
    text-align: center;
  }

  a {
    color: #696766;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  h5,
  h6 {
    font-weight: 600;
    font-size: 15px;
  }
`;

export const RichTextContainerCompact = styled.div`
  p {
    min-height: 1rem;
  }
  p:first-child {
    margin-top: 0 !important;
    margin-bottom: 0;
  }

  > * + * {
    margin-top: 0 !important;
    margin-bottom: 0;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }
`;
