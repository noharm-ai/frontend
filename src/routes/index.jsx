import { useRoutes } from "react-router-dom";

/**
 * Routes map
 */
import routes from "./routes";

const App = () => {
  return useRoutes(routes);
};

export default App;
