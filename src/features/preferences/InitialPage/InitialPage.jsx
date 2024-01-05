import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import { setInitialPage, savePreferences } from "../PreferencesSlice";

export default function InitialPage() {
  const location = useLocation();
  const dispatch = useDispatch();
  const initialPage = useSelector((state) => state.preferences.app.initialPage);

  const setConfig = () => {
    dispatch(setInitialPage(location.pathname));
    dispatch(savePreferences());
    notification.success({
      message: "Página Inicial definida com sucesso.",
    });
  };

  if (location.pathname !== initialPage) {
    return (
      <Tooltip title="Definir esta página como Página Inicial">
        <Button onClick={setConfig}>Definir como Página Inicial</Button>
      </Tooltip>
    );
  }
}
