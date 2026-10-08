import styled from "styled-components";

import { breakpointsEnum } from "styles/breakpoints";

const mobile = `@media (max-width: ${breakpointsEnum.md - 1}px)`;

export const ModalScroll = styled.div`
  max-height: 72vh;
  margin: 0 -24px;
  padding: 0 24px;
  overflow-y: auto;

  /* the modal already frames the article: no second card around it */
  .article-content {
    padding: 8px 0 0;
    background: none;
    box-shadow: none;

    ${mobile} {
      padding: 0;
    }
  }
`;

export const ModalRelated = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;
