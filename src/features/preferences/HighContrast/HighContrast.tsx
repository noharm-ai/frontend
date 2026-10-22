import { Flex, Switch } from "antd";

import { useAppDispatch, useAppSelector } from "store/index";
import { setHighContrast, savePreferences } from "../PreferencesSlice";

export function HighContrast() {
  const dispatch = useAppDispatch();
  const highContrast = useAppSelector(
    (state: any) => !!state.preferences.app.highContrast,
  );

  const onChange = (checked: boolean) => {
    dispatch(setHighContrast(checked));
    dispatch(savePreferences());
  };

  return (
    <>
      <Flex align="center" gap={8}>
        <Switch
          id="preferences-high-contrast"
          checked={highContrast}
          onChange={onChange}
        />
        <label htmlFor="preferences-high-contrast">Alto contraste</label>
      </Flex>
      <p style={{ marginBottom: 0 }}>
        Escurece textos, bordas e cores de destaque e reforça o indicador de
        foco, facilitando a leitura para quem tem baixa visão.
      </p>
    </>
  );
}
