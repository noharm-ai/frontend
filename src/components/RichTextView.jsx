import React from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
  p {
    margin-top: 5px !important;
    max-width: 700px;
  }
`;

const textToHtml = obs => {
  if (obs && obs !== 'None') {
    return obs.replace(/(?:\r\n|\r|\n)/g, '<br>');
  }

  return '--';
};

const RichTextView = ({ text }) => {
  return <Container dangerouslySetInnerHTML={{ __html: textToHtml(text) }} />;
};

export default RichTextView;
