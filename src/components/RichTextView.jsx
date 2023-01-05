import React from "react";
import styled from "styled-components/macro";
import DOMPurify from "dompurify";

const Container = styled.div`
  p {
    margin-top: 5px !important;
    max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}` : "700px")};
  }
`;

const textToHtml = (obs) => {
  if (obs && obs !== "None") {
    return obs.replace(/(?:\r\n|\r|\n)/g, "<br>");
  }

  return "--";
};

const RichTextView = ({ text, maxWidth }) => {
  return (
    <Container
      maxWidth={maxWidth}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(textToHtml(text), { ADD_ATTR: ["target"] }),
      }}
    />
  );
};

export default RichTextView;
