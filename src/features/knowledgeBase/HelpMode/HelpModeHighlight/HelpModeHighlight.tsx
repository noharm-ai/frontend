import { useTranslation } from "react-i18next";
import { Button, Popconfirm, Popover, Tag } from "antd";
import {
  AimOutlined,
  DeleteOutlined,
  EditOutlined,
  QuestionOutlined,
} from "@ant-design/icons";

import { GLOBAL_PAGE, IHelpElement } from "../HelpModeSlice";
import { IRect } from "../helpDom";
import {
  HELP_LAYER_Z_INDEX,
  HighlightBox,
  PopoverBody,
} from "../HelpModeLayer/HelpModeLayer.style";

interface IHelpModeHighlightProps {
  item: IHelpElement;
  rect: IRect;
  open: boolean;
  // stepped aside: the element under it takes the clicks
  aside: boolean;
  canEdit: boolean;
  container: HTMLElement | null;
  onOpenChange: (open: boolean) => void;
  onOpenArticle: (id: number) => void;
  onRemoveArticle: (id: number) => void;
  onUseElement: () => void;
  onEdit: () => void;
}

/**
 * One pinned element: a box over it that takes the click in its place, and
 * the articles pinned to it. "Use the element" steps the box aside until the
 * pointer leaves the element, for when the help is on a button the user still
 * needs to click.
 */
export function HelpModeHighlight({
  item,
  rect,
  open,
  aside,
  canEdit,
  container,
  onOpenChange,
  onOpenArticle,
  onRemoveArticle,
  onUseElement,
  onEdit,
}: IHelpModeHighlightProps) {
  const { t } = useTranslation();

  const content = (
    <PopoverBody>
      {item.label && <p className="popover-label">{item.label}</p>}
      <ul>
        {item.articles.map((article) => (
          <li key={article.id}>
            <button
              type="button"
              className="popover-article"
              onClick={() => onOpenArticle(article.id)}
            >
              <strong>{article.title}</strong>
              {article.description && <span>{article.description}</span>}
            </button>
            {canEdit && (
              <Popconfirm
                title={t("helpMode.editor.removeArticleConfirm", {
                  title: article.title,
                })}
                zIndex={HELP_LAYER_Z_INDEX + 20}
                getPopupContainer={container ? () => container : undefined}
                onConfirm={() => onRemoveArticle(article.id)}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={t("helpMode.editor.removeArticle")}
                  title={t("helpMode.editor.removeArticle")}
                />
              </Popconfirm>
            )}
          </li>
        ))}
      </ul>
      <div className="popover-footer">
        <Button
          size="small"
          icon={<AimOutlined />}
          title={t("helpMode.useElementHint")}
          onClick={onUseElement}
        >
          {t("helpMode.useElement")}
        </Button>
        {canEdit && (
          <span className="popover-footer-actions">
            <Tag>
              {item.page === GLOBAL_PAGE
                ? t("helpMode.allScreens")
                : t("helpMode.thisScreen")}
            </Tag>
            <Button size="small" icon={<EditOutlined />} onClick={onEdit}>
              {t("helpMode.edit")}
            </Button>
          </span>
        )}
      </div>
    </PopoverBody>
  );

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      trigger="click"
      placement="bottomLeft"
      content={content}
      zIndex={HELP_LAYER_Z_INDEX + 10}
      getPopupContainer={container ? () => container : undefined}
      destroyOnHidden
    >
      <HighlightBox
        $open={open}
        $aside={aside}
        aria-hidden={aside || undefined}
        role="button"
        tabIndex={0}
        aria-label={item.label || String(t("helpMode.highlight"))}
        data-help-selector={item.selector}
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenChange(!open);
          }
        }}
      >
        <span className="help-badge">
          {item.articles.length > 1 ? (
            item.articles.length
          ) : (
            <QuestionOutlined />
          )}
        </span>
      </HighlightBox>
    </Popover>
  );
}
