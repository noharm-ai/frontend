import React, { useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Collapse, Input, Tabs } from "antd";
import {
  CopyOutlined,
  ClearOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import DefaultModal from "components/Modal";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import EditorBase from "components/Editor";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Editor = EditorBase as any;
import { setCarePlanOpen } from "features/prescription/PrescriptionSlice";
import { BASE_TEMPLATE, BASE_TEMPLATES, SNIPPET_CATEGORIES } from "./mockData";
import {
  CarePlanLayout,
  SnippetsPanel,
  SearchWrapper,
  SnippetButton,
  TemplateButton,
  EditorPanel,
} from "./CarePlan.style";

interface RootState {
  prescriptionv2: {
    carePlan: {
      open: boolean;
    };
  };
}

interface EditorHandle {
  insertContent: (html: string) => void;
  setContent: (html: string) => void;
  getText: () => string;
}

const escapeHtml = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const snippetToHtml = (text: string): string =>
  text
    .trim()
    .split("\n")
    .map((line) => `<p>${line ? escapeHtml(line) : "<br/>"}</p>`)
    .join("");

export function CarePlan() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const open = useSelector(
    (state: RootState) => state.prescriptionv2.carePlan.open,
  );
  const editorRef = useRef<EditorHandle | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("templates");

  const handleClose = useCallback(() => {
    dispatch(setCarePlanOpen(false));
    setSearchQuery("");
  }, [dispatch]);

  const insertSnippet = useCallback((text: string) => {
    editorRef.current?.insertContent(snippetToHtml(text));
  }, []);

  const applyTemplate = useCallback(
    (content: string) => {
      editorRef.current?.setContent(content);
      notification.success({ message: t("carePlan.templateApplied") });
    },
    [t],
  );

  const handleCopy = useCallback(() => {
    const text = editorRef.current?.getText() ?? "";
    navigator.clipboard.writeText(text);
    notification.success({ message: t("carePlan.copiedSuccess") });
  }, [t]);

  const handleClear = useCallback(() => {
    editorRef.current?.setContent(BASE_TEMPLATE);
  }, []);

  const handleSave = useCallback(() => {
    notification.info({ message: t("carePlan.saveComingSoon") });
  }, [t]);

  const filteredCategories = SNIPPET_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  })).filter((cat) => cat.items.length > 0);

  const collapseItems = filteredCategories.map((cat) => ({
    key: cat.category,
    label: cat.category,
    children: (
      <>
        {cat.items.map((item) => (
          <Tooltip
            key={item.title}
            title={t("carePlan.insertHint")}
            placement="right"
          >
            <SnippetButton
              type="button"
              onClick={() => insertSnippet(item.text)}
            >
              {item.title}
            </SnippetButton>
          </Tooltip>
        ))}
      </>
    ),
  }));

  const tabItems = [
    {
      key: "templates",
      label: (
        <span>
          <FileTextOutlined /> {t("carePlan.tabTemplates")}
        </span>
      ),
      children: (
        <div className="panel-scroll">
          {BASE_TEMPLATES.map((tpl) => (
            <Tooltip
              key={tpl.title}
              title={t("carePlan.applyTemplateHint")}
              placement="right"
            >
              <TemplateButton
                type="button"
                onClick={() => applyTemplate(tpl.content)}
              >
                <span className="template-title">{tpl.title}</span>
                <span className="template-desc">{tpl.description}</span>
              </TemplateButton>
            </Tooltip>
          ))}
        </div>
      ),
    },
    {
      key: "texts",
      label: (
        <span>
          <UnorderedListOutlined /> {t("carePlan.tabTexts")}
        </span>
      ),
      children: (
        <>
          <SearchWrapper>
            <Input
              placeholder={t("carePlan.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              size="small"
            />
          </SearchWrapper>
          <div className="panel-scroll">
            {collapseItems.length > 0 ? (
              <Collapse
                items={collapseItems}
                defaultActiveKey={[SNIPPET_CATEGORIES[0]?.category]}
              />
            ) : (
              <div
                style={{
                  padding: "16px",
                  fontSize: 13,
                  opacity: 0.5,
                  textAlign: "center",
                }}
              >
                {t("carePlan.noResults")}
              </div>
            )}
          </div>
        </>
      ),
    },
  ];

  return (
    <DefaultModal
      title={t("carePlan.title")}
      open={open}
      onCancel={handleClose}
      width="85vw"
      centered
      destroyOnHidden
      maskClosable={false}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button danger ghost onClick={handleClear} icon={<ClearOutlined />}>
            {t("carePlan.btnClear")}
          </Button>
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={handleClose}>{t("carePlan.btnCancel")}</Button>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              {t("carePlan.btnCopy")}
            </Button>
            <Button type="primary" onClick={handleSave}>
              {t("carePlan.btnSave")}
            </Button>
          </div>
        </div>
      }
    >
      <CarePlanLayout>
        <SnippetsPanel>
          <Tabs
            items={tabItems}
            size="small"
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        </SnippetsPanel>

        <EditorPanel>
          <Editor
            ref={editorRef}
            content={BASE_TEMPLATE}
            onEdit={() => {}}
            utilities={["basic"]}
          />
        </EditorPanel>
      </CarePlanLayout>
    </DefaultModal>
  );
}
