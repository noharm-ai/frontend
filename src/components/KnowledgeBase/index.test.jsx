import React from 'react';
import ReactDOM from 'react-dom';
import KnowledgeBase from './';

it('renders without crashing', async () => {
  const div = document.createElement('div');
  ReactDOM.render(<KnowledgeBase />, div);
  ReactDOM.unmountComponentAtNode(div);
});
