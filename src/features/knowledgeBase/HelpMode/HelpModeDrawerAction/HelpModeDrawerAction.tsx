import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { AimOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import { setSupportOpen } from "features/support/SupportSlice";
import {
  trackKnowledgeBaseAction,
  TrackedKnowledgeBaseAction,
} from "utils/tracker";

import { setHelpModeActive } from "../HelpModeSlice";
import { ActionCard } from "./HelpModeDrawerAction.style";

/**
 * The help mode's switch, first thing in the support drawer: the quickest
 * help, on the very screen, before articles, the AI agent and tickets
 */
export function HelpModeDrawerAction() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const active = useAppSelector((state) => state.helpMode.active);
  const page = useAppSelector((state) => state.helpMode.page);

  const toggle = () => {
    dispatch(setHelpModeActive(!active));
    if (!active) {
      trackKnowledgeBaseAction(TrackedKnowledgeBaseAction.ACTIVATE_HELP_MODE, {
        page,
        via: "drawer",
      });
      // the drawer would cover the highlights
      dispatch(setSupportOpen(false));
    }
  };

  return (
    <ActionCard>
      <AimOutlined />
      <div className="action-text">
        <div className="action-title">
          {active
            ? t("helpMode.drawer.activeTitle")
            : t("helpMode.drawer.title")}
        </div>
        <div className="action-hint">
          {active ? t("helpMode.drawer.activeHint") : t("helpMode.drawer.hint")}
        </div>
      </div>
      <Button
        id="gtm-btn-help-mode"
        type={active ? "default" : "primary"}
        onClick={toggle}
      >
        {active ? t("helpMode.drawer.exit") : t("helpMode.drawer.show")}
      </Button>
    </ActionCard>
  );
}
