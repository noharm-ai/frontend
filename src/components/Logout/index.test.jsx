import React from 'react';
import ReactDOM from 'react-dom';
import Logout from './';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Logout doLogout={() => false} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
