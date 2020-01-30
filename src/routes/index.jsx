import React from 'react';
import { Switch } from 'react-router-dom';

import App from '@containers/App';
import FancyRoute from '@components/FancyRoute';

/**
 * Routes map
 */
import routes from './routes';

const Routes = () => (
  <App>
    <Switch>
      {routes.map(route => (
        <FancyRoute key={route.path} {...route} />
      ))}
    </Switch>
  </App>
);

export default Routes;
