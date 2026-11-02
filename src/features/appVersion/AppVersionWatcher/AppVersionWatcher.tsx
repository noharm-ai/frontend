import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "antd";

import notification from "components/notification";
import { useAppSelector } from "store/index";
import { reloadApp } from "../appVersionCheck";

const NOTIFICATION_KEY = "app-version-update";

/**
 * Keeps long-lived tabs on the deployed version (see appVersionCheck).
 *
 * Once a newer build is known, offers to update and reloads on the next
 * screen change: the user just left the previous screen, so no work in
 * progress is lost.
 */
export function AppVersionWatcher() {
  const location = useLocation();
  const { t } = useTranslation();
  const updateAvailable = useAppSelector(
    (state) => state.appVersion.updateAvailable,
  );
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;

    // navigation state (e.g. where a page came from) would not survive a
    // reload: leave it to the next screen change
    if (updateAvailable && !location.state) {
      reloadApp();
    }
  }, [location, updateAvailable]);

  useEffect(() => {
    if (!updateAvailable) return;

    notification.info({
      key: NOTIFICATION_KEY,
      title: t("appVersion.title"),
      description: t("appVersion.description"),
      duration: 0,
      actions: (
        <Button type="primary" size="small" onClick={() => reloadApp()}>
          {t("appVersion.reload")}
        </Button>
      ),
    });
  }, [updateAvailable, t]);

  return null;
}
