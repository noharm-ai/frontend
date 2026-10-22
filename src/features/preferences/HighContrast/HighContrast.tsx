import { Flex, Switch } from "antd";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "store/index";
import { setHighContrast, savePreferences } from "../PreferencesSlice";

export function HighContrast() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const highContrast = useAppSelector(
    // PreferencesSlice is untyped JS, so its state is not in IRootState
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
        <label htmlFor="preferences-high-contrast">
          {t("accessibility.highContrast")}
        </label>
      </Flex>
      <p style={{ marginBottom: 0 }}>
        {t("accessibility.highContrastDescription")}
      </p>
    </>
  );
}
