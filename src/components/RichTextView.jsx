import React from 'react';

const textToHtml = obs => {
  if (obs && obs !== 'None') {
    return obs.replace(/(?:\r\n|\r|\n)/g, '<br>');
  }

  return '--';
};

const RichTextView = ({ text }) => {
  return (
    <div dangerouslySetInnerHTML={{ __html: textToHtml(text) }} style={{ maxWidth: '700px' }} />
  );
};

export default RichTextView;
