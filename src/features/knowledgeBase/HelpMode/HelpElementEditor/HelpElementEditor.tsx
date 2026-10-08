import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, Form, Input, Popconfirm, Radio, Select } from "antd";
import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";

import { fetchKnowledgeBaseArticles } from "../../KnowledgeBaseSlice";
import {
  closeHelpElementEditor,
  GLOBAL_PAGE,
  saveHelpElement,
} from "../HelpModeSlice";
import { ArticleList, ElementCode } from "./HelpElementEditor.style";

// same limit the API enforces
const MAX_ARTICLES = 20;

interface IHelpElementEditorProps {
  // route pattern of the current screen
  page: string | null;
}

/**
 * Pins articles to the element a curator picked, or changes/removes the
 * articles of an element already pinned
 */
export function HelpElementEditor({ page }: IHelpElementEditorProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { draft, status } = useAppSelector((state) => state.helpMode.editor);
  const articles = useAppSelector((state) => state.knowledgeBase.list);

  const [scope, setScope] = useState<string>(GLOBAL_PAGE);
  const [label, setLabel] = useState("");
  const [articleIds, setArticleIds] = useState<number[]>([]);

  // a new draft (another element picked) starts the form over
  const [formDraft, setFormDraft] = useState<typeof draft>(null);
  if (draft !== formDraft) {
    setFormDraft(draft);

    if (draft) {
      setScope(draft.page);
      setLabel(draft.label ?? "");
      setArticleIds(draft.articleIds);
    }
  }

  useEffect(() => {
    if (draft && articles.status === "idle") {
      dispatch(fetchKnowledgeBaseArticles());
    }
  }, [dispatch, draft, articles.status]);

  const titles = useMemo(
    () => new Map(articles.data.map((article) => [article.id, article.title])),
    [articles.data],
  );
  // the articles not pinned yet
  const options = useMemo(
    () =>
      articles.data
        .filter((article) => !articleIds.includes(article.id))
        .map((article) => ({ value: article.id, label: article.title })),
    [articles.data, articleIds],
  );

  const close = () => dispatch(closeHelpElementEditor());

  const save = (ids: number[]) => {
    if (!draft) return;

    dispatch(
      saveHelpElement({
        page: scope,
        selector: draft.selector,
        label: label.trim() || null,
        articleIds: ids,
      }),
    ).then((response: any) => {
      if (response.error) {
        notification.error({ message: t("helpMode.editor.saveError") });
        return;
      }

      notification.success({
        message: ids.length
          ? t("helpMode.editor.saveSuccess")
          : t("helpMode.editor.removeSuccess"),
      });
    });
  };

  const saving = status === "loading";

  return (
    <DefaultModal
      open={draft !== null}
      title={
        draft?.existing
          ? t("helpMode.editor.titleEdit")
          : t("helpMode.editor.titleNew")
      }
      width={560}
      destroyOnHidden
      onCancel={close}
      footer={
        <>
          {draft?.existing && (
            <Popconfirm
              title={t("helpMode.editor.removeConfirm")}
              onConfirm={() => save([])}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={saving}
                style={{ float: "left" }}
              >
                {t("helpMode.editor.remove")}
              </Button>
            </Popconfirm>
          )}
          <Button onClick={close} disabled={saving}>
            {t("helpMode.cancel")}
          </Button>
          <Button
            type="primary"
            loading={saving}
            disabled={!draft?.existing && articleIds.length === 0}
            onClick={() => save(articleIds)}
          >
            {t("helpMode.editor.save")}
          </Button>
        </>
      }
    >
      {draft && (
        <Form layout="vertical" requiredMark={false}>
          <Form.Item label={t("helpMode.editor.element")}>
            <ElementCode>{draft.selector}</ElementCode>
            {draft.fragile && (
              <Alert
                type="warning"
                showIcon
                style={{ marginTop: 8 }}
                title={t("helpMode.editor.fragileWarning")}
              />
            )}
          </Form.Item>

          <Form.Item label={t("helpMode.editor.scope")}>
            <Radio.Group
              value={scope}
              disabled={draft.existing}
              onChange={(event) => setScope(event.target.value)}
            >
              {page && (
                <Radio value={page}>
                  {t("helpMode.thisScreen")} <code>{page}</code>
                </Radio>
              )}
              {draft.existing &&
                draft.page !== page &&
                draft.page !== GLOBAL_PAGE && (
                  <Radio value={draft.page}>
                    <code>{draft.page}</code>
                  </Radio>
                )}
              <Radio value={GLOBAL_PAGE}>{t("helpMode.allScreens")}</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label={t("helpMode.editor.label")}>
            <Input
              value={label}
              maxLength={255}
              placeholder={t("helpMode.editor.labelPlaceholder")}
              onChange={(event) => setLabel(event.target.value)}
            />
          </Form.Item>

          <Form.Item
            label={t("helpMode.editor.articles")}
            help={
              articleIds.length === 0
                ? t("helpMode.editor.articlesRequired")
                : undefined
            }
          >
            {articleIds.length > 0 && (
              <ArticleList>
                {articleIds.map((id) => (
                  <li key={id}>
                    <span>{titles.get(id) ?? "…"}</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined />}
                      aria-label={t("helpMode.editor.removeArticle")}
                      title={t("helpMode.editor.removeArticle")}
                      onClick={() =>
                        setArticleIds((ids) => ids.filter((i) => i !== id))
                      }
                    />
                  </li>
                ))}
              </ArticleList>
            )}
            <Select<number>
              value={null}
              options={options}
              loading={articles.status === "loading"}
              disabled={articleIds.length >= MAX_ARTICLES}
              placeholder={t("helpMode.editor.addArticle")}
              showSearch={{ optionFilterProp: "label" }}
              style={{ width: "100%" }}
              onChange={(id) => setArticleIds((ids) => [...ids, id])}
            />
          </Form.Item>
        </Form>
      )}
    </DefaultModal>
  );
}
