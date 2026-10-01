import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";

import { setHelpModeActive } from "../HelpModeSlice";
import { TogglePill } from "./HelpModeToggle.style";

/**
 * Header switch for the help mode (HelpModeLayer)
 */
export function HelpModeToggle() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const active = useAppSelector((state) => state.helpMode.active);
  // the elements are only fetched while the help mode is on
  const count = useAppSelector((state) => {
    const { active, page, byPage } = state.helpMode;

    return active && page ? (byPage[page]?.list.length ?? 0) : 0;
  });

  return (
    <Tooltip
      title={
        active ? t("helpMode.toggleTooltipActive") : t("helpMode.toggleTooltip")
      }
      placement="bottom"
    >
      <TogglePill
        type="button"
        id="gtm-btn-help-mode"
        $active={active}
        aria-pressed={active}
        onClick={() => dispatch(setHelpModeActive(!active))}
      >
        <QuestionCircleOutlined />
        <span className="pill-label">{t("helpMode.toggle")}</span>
        {count > 0 && <span className="pill-count">{count}</span>}
      </TogglePill>
    </Tooltip>
  );
}
