import { useTranslation } from "react-i18next";
import { Badge, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import { setSupportOpen } from "features/support/SupportSlice";

import { TriggerButton } from "./HelpTrigger.style";

/**
 * Header entry to help: opens the support drawer, where the help mode is
 * switched on, next to the screen's articles, the AI agent and tickets. The
 * user menu keeps its own "Ajuda" for the users used to it.
 */
export function HelpTrigger() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const helpModeActive = useAppSelector((state) => state.helpMode.active);

  return (
    <Tooltip title={t("layout.help")} placement="bottom">
      <TriggerButton
        type="button"
        id="gtm-btn-header-help"
        aria-label={t("layout.help")}
        onClick={() => dispatch(setSupportOpen(true))}
      >
        <Badge dot={helpModeActive}>
          <QuestionCircleOutlined />
        </Badge>
      </TriggerButton>
    </Tooltip>
  );
}
