import { useLocation } from "react-router-dom";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import { useAppDispatch, useAppSelector } from "store/index";
import { setInitialPage, savePreferences } from "../PreferencesSlice";

export function InitialPage() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const initialPage = useAppSelector(
    (state) => state.preferences.app.initialPage,
  );

  const setConfig = () => {
    dispatch(setInitialPage(location.pathname));
    dispatch(savePreferences());
    notification.success({
      message: "Página Inicial definida com sucesso.",
    });
  };

  if (location.pathname === initialPage) {
    return null;
  }

  return (
    <Tooltip title="Definir esta página como Página Inicial">
      <Button onClick={setConfig}>Definir como Página Inicial</Button>
    </Tooltip>
  );
}
