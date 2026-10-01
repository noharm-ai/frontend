import { useTranslation } from "react-i18next";
import { Button, Popover } from "antd";
import {
  CloseOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import { IHelpElement } from "../HelpModeSlice";
import {
  Bar,
  HELP_LAYER_Z_INDEX,
  HiddenList,
} from "../HelpModeLayer/HelpModeLayer.style";

interface IHelpModeBarProps {
  picking: boolean;
  canEdit: boolean;
  visibleCount: number;
  hidden: IHelpElement[];
  container: HTMLElement | null;
  onPick: (picking: boolean) => void;
  onEdit: (item: IHelpElement) => void;
  onExit: () => void;
}

/**
 * Floating bar while the help mode is on: what to do, and the way out.
 * Curators also add help and reach the pinned elements not on screen.
 */
export function HelpModeBar({
  picking,
  canEdit,
  visibleCount,
  hidden,
  container,
  onPick,
  onEdit,
  onExit,
}: IHelpModeBarProps) {
  const { t } = useTranslation();

  if (picking) {
    return (
      <Bar role="status">
        <span className="bar-title">
          <PlusOutlined />
          {t("helpMode.add")}
        </span>
        <span className="bar-hint">{t("helpMode.pickHint")}</span>
        <div className="bar-actions">
          <Button size="small" onClick={() => onPick(false)}>
            {t("helpMode.cancel")}
          </Button>
        </div>
      </Bar>
    );
  }

  return (
    <Bar role="status">
      <span className="bar-title">
        <QuestionCircleOutlined />
        {t("helpMode.barTitle")}
      </span>
      <span className="bar-hint">
        {visibleCount > 0 ? t("helpMode.barHint") : t("helpMode.barEmpty")}
      </span>
      <div className="bar-actions">
        {canEdit && hidden.length > 0 && (
          <Popover
            trigger="click"
            placement="top"
            zIndex={HELP_LAYER_Z_INDEX + 10}
            getPopupContainer={container ? () => container : undefined}
            title={t("helpMode.hiddenTitle")}
            content={
              <HiddenList>
                {hidden.map((item) => (
                  <li key={`${item.page}|${item.selector}`}>
                    <button type="button" onClick={() => onEdit(item)}>
                      <strong>
                        {item.label ||
                          item.articles.map((a) => a.title).join(", ")}
                      </strong>
                      <code>{item.selector}</code>
                    </button>
                  </li>
                ))}
              </HiddenList>
            }
          >
            <Button size="small" icon={<EyeInvisibleOutlined />}>
              {t("helpMode.hidden", { count: hidden.length })}
            </Button>
          </Popover>
        )}
        {canEdit && (
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onPick(true)}
          >
            {t("helpMode.add")}
          </Button>
        )}
        <Button size="small" icon={<CloseOutlined />} onClick={onExit}>
          {t("helpMode.exit")}
        </Button>
      </div>
    </Bar>
  );
}
