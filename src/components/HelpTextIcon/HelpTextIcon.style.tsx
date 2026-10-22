import styled from "styled-components";

import Button from "components/Button";
import { get } from "styles/utils";

export const IconButton = styled(Button)`
  vertical-align: middle;
  font-size: 18px;
  color: ${get("colors.primary")};
`;

export const ModalBody = styled.div`
  max-height: 68vh;
  overflow-y: auto;
`;

export const EmptyNote = styled.p`
  margin: 0;
  color: ${get("colors.text")};
`;

export const HtmlContent = styled.div`
  padding: 1rem;
  background: #fafafa;
  border-radius: 6px;
  line-height: 1.5;

  p {
    margin: 0 0 0.5rem;
  }

  ul,
  ol {
    padding-left: 20px;
    margin: 0 0 0.5rem;
  }

  a {
    color: ${get("colors.primary")};
  }

  .help-video {
    position: relative;
    margin: 0.5rem 0;
    padding-top: 56.25%;
    border-radius: 6px;
    overflow: hidden;
    background: ${get("colors.commonDarker")};

    iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
  }
`;
