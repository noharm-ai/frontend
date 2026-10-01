import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { createGlobalStyle } from "styled-components";
import { Button, Popover } from "antd";
import {
  CloseOutlined,
  CustomerServiceOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import { IHelpElement } from "../HelpModeSlice";
import { HelpModePageArticles } from "../HelpModePageArticles/HelpModePageArticles";
import {
  Bar,
  HELP_BAR_HEIGHT_VAR,
  HELP_LAYER_Z_INDEX,
  HiddenList,
} from "../HelpModeLayer/HelpModeLayer.style";

// room for the bar above the app: the page, and whatever is fixed to the top
// of the viewport (modals, side drawers, affixed blocks). The sider, fixed
// too, follows the same variable (Layout.style).
const MakeRoom = createGlobalStyle`
  body {
    padding-top: var(${HELP_BAR_HEIGHT_VAR}, 0px);
  }

  /* important: antd's own (hashed, more specific) rules set inset: 0 */
  .ant-modal-wrap,
  .ant-drawer-left > .ant-drawer-content-wrapper,
  .ant-drawer-right > .ant-drawer-content-wrapper,
  .ant-drawer-top > .ant-drawer-content-wrapper {
    top: var(${HELP_BAR_HEIGHT_VAR}, 0px) !important;
  }

  /* antd sets the affixed top inline, from the viewport */
  .ant-affix {
    margin-top: var(${HELP_BAR_HEIGHT_VAR}, 0px);
  }
`;

/**
 * Keeps the bar's height in a CSS variable on <html> while it is mounted
 */
const useBarHeight = () => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const bar = ref.current;
    if (!bar) return undefined;

    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty(HELP_BAR_HEIGHT_VAR, `${bar.offsetHeight}px`);

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(bar);

    return () => {
      observer.disconnect();
      root.style.removeProperty(HELP_BAR_HEIGHT_VAR);
    };
  }, []);

  return ref;
};

interface IHelpModeBarProps {
  picking: boolean;
  canEdit: boolean;
  visibleCount: number;
  // every element of the screen, and those not on screen right now
  elements: IHelpElement[];
  hidden: IHelpElement[];
  container: HTMLElement | null;
  onPick: (picking: boolean) => void;
  onEdit: (item: IHelpElement) => void;
  onOpenArticle: (id: number) => void;
  articlesOpen: boolean;
  onArticlesOpenChange: (open: boolean) => void;
  // the support drawer: more articles, the AI agent and tickets
  onMoreHelp: () => void;
  onExit: () => void;
}

/**
 * Bar above the app's header while the help mode is on: what to do, and the
 * way out. Curators also add help and reach the pinned elements not on
 * screen.
 */
export function HelpModeBar({
  picking,
  canEdit,
  visibleCount,
  elements,
  hidden,
  container,
  onPick,
  onEdit,
  onOpenArticle,
  articlesOpen,
  onArticlesOpenChange,
  onMoreHelp,
  onExit,
}: IHelpModeBarProps) {
  const { t } = useTranslation();
  const ref = useBarHeight();

  if (picking) {
    return (
      <Bar role="status" ref={ref}>
        <MakeRoom />
        <div className="bar-text">
          <span className="bar-title">
            <PlusOutlined />
            {t("helpMode.add")}
          </span>
          <span className="bar-hint">{t("helpMode.pickHint")}</span>
        </div>
        <div className="bar-actions">
          <Button size="small" onClick={() => onPick(false)}>
            {t("helpMode.cancel")}
          </Button>
        </div>
      </Bar>
    );
  }

  return (
    <Bar role="status" ref={ref}>
      <MakeRoom />
      <div className="bar-text">
        <span className="bar-title">
          <QuestionCircleOutlined />
          {t("helpMode.barTitle")}
        </span>
        <span className="bar-hint">
          {visibleCount > 0 ? t("helpMode.barHint") : t("helpMode.barEmpty")}
        </span>
      </div>
      <div className="bar-actions">
        <HelpModePageArticles
          elements={elements}
          open={articlesOpen}
          onOpenChange={onArticlesOpenChange}
          onOpenArticle={onOpenArticle}
        />
        <Button
          size="small"
          icon={<CustomerServiceOutlined />}
          onClick={onMoreHelp}
        >
          {t("helpMode.moreHelp")}
        </Button>
        {canEdit && hidden.length > 0 && (
          <Popover
            trigger="click"
            placement="bottom"
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
