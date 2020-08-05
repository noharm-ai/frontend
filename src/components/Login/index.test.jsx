import React from 'react';
import ReactDOM from 'react-dom';
import Login from './';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Login isLogging={false} doLogin={() => false} match={{ params: {} }} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
