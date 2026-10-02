import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover, Spin, Switch } from "antd";
import { EditOutlined, QuestionOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import {
  trackKnowledgeBaseAction,
  TrackedKnowledgeBaseAction,
} from "utils/tracker";

import { useArticleModal } from "../useArticleModal";
import {
  fetchHelpElements,
  GLOBAL_PAGE,
  IHelpElement,
  openHelpElementEditor,
  setHelpModeActive,
} from "../HelpMode/HelpModeSlice";
import { kbSelector } from "../HelpMode/helpDom";
import { IconButton, PopoverBody } from "./KnowledgeBaseIcon.style";

interface IKnowledgeBaseIconProps {
  // data-kb anchor of the icon (e.g. "prioritization.departments"): unique on
  // the screen, renaming it loses the articles pinned to it
  anchor: string;
  // label of the element in the help mode
  label?: string;
}

const NO_ELEMENTS: IHelpElement[] = [];

/**
 * Like HelpTextIcon, but shows knowledge base articles. The articles are
 * pinned to the icon itself in the help mode's elements, so they also show in
 * the help mode, and curators (WRITE_HELP_TEXT) edit them with its editor.
 */
export function KnowledgeBaseIcon({ anchor, label }: IKnowledgeBaseIconProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { openArticle } = useArticleModal();
  const [open, setOpenState] = useState(false);
  // closed while its articles were loading: they must not reopen it
  const openRef = useRef(false);
  const setOpen = (value: boolean) => {
    openRef.current = value;
    setOpenState(value);
  };

  const helpModeActive = useAppSelector((state) => state.helpMode.active);
  const canEdit = PermissionService().has(Permission.WRITE_HELP_TEXT);
  const selector = kbSelector(anchor);

  const page = useAppSelector((state) => state.helpMode.page) ?? GLOBAL_PAGE;
  const cached = useAppSelector((state) => state.helpMode.byPage[page]);
  const loading = !cached || cached.status === "loading";

  // the screen's pin wins over a global one
  const findElement = (list: IHelpElement[]) =>
    list.find((item) => item.selector === selector && item.page === page) ??
    list.find((item) => item.selector === selector);

  const element = findElement(cached?.list ?? NO_ELEMENTS);
  const articles = element?.articles ?? [];

  const handleClick = async () => {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);

    // fetched once per screen, and again after a save empties the cache
    if (cached?.status !== "succeeded") {
      const response: any = await dispatch(fetchHelpElements(page));

      // closed while loading: no error popping up over the screen either
      if (response.error && openRef.current) {
        setOpen(false);
        notification.error({ message: t("knowledgeBaseIcon.loadError") });
      }
    }
  };

  const toggleHelpMode = (value: boolean) => {
    dispatch(setHelpModeActive(value));

    if (value) {
      trackKnowledgeBaseAction(TrackedKnowledgeBaseAction.ACTIVATE_HELP_MODE, {
        page,
        via: "kbIcon",
      });
      // the popover would cover the highlights
      setOpen(false);
    }
  };

  const edit = () => {
    setOpen(false);
    dispatch(
      openHelpElementEditor({
        page: element?.page ?? page,
        selector,
        label: element?.label ?? label ?? null,
        articleIds: articles.map((article) => article.id),
        fragile: false,
        existing: !!element,
      }),
    );
  };

  let body;
  if (loading) {
    body = <Spin size="small" />;
  } else if (articles.length) {
    body = (
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <button
              type="button"
              className="kb-article"
              onClick={() => {
                setOpen(false);
                openArticle(article.id);
              }}
            >
              <strong>{article.title}</strong>
              {article.description && <span>{article.description}</span>}
            </button>
          </li>
        ))}
      </ul>
    );
  } else {
    body = <p className="kb-empty">{t("knowledgeBaseIcon.empty")}</p>;
  }

  return (
    <Popover
      open={open}
      trigger="click"
      placement="bottomLeft"
      title={t("knowledgeBaseIcon.title")}
      onOpenChange={(value) => {
        if (!value) setOpen(false);
      }}
      content={
        <PopoverBody>
          {body}
          <div className="kb-footer">
            <label className="kb-help-mode">
              <Switch
                size="small"
                checked={helpModeActive}
                onChange={toggleHelpMode}
              />
              {t("knowledgeBaseIcon.helpMode")}
            </label>
            {canEdit && !loading && (
              <Button size="small" icon={<EditOutlined />} onClick={edit}>
                {t("knowledgeBaseIcon.edit")}
              </Button>
            )}
          </div>
        </PopoverBody>
      }
    >
      <Tooltip title={open ? null : t("knowledgeBaseIcon.title")}>
        <IconButton
          type="primary"
          shape="circle"
          size="small"
          data-kb={anchor}
          aria-label={t("knowledgeBaseIcon.title")}
          icon={<QuestionOutlined />}
          onClick={handleClick}
        />
      </Tooltip>
    </Popover>
  );
}
