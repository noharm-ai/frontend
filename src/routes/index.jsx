import React from "react";
import {
  Routes,
  Route,
  useRoutes,
  BrowserRouter as Router,
} from "react-router-dom";

import FancyRoute from "components/FancyRoute";
import withAuth from "lib/withAuth";

import Login from "pages/Login";
import Logout from "pages/Logout";

/**
 * Routes map
 */
import routes from "./routes";

const App = () => {
  return useRoutes(routes);
};

const AppWrapper = () => {
  return <App />;
};

export default App;
