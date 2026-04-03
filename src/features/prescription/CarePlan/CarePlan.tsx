import React, { useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Alert, Collapse, Input, Spin, Tabs } from "antd";
import {
  ClearOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import DefaultModal from "components/Modal";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import EditorBase from "components/Editor";
const Editor = EditorBase as any;
import {
  setCarePlanOpen,
  createCarePlan,
} from "features/prescription/PrescriptionSlice";
import { fetchDraft } from "features/memory/MemoryDraft/MemoryDraftSlice";
import { getErrorMessage } from "src/utils/errorHandler";
import { processCarePlanTemplate } from "./processTemplate";
import type { Template, SnippetCategory } from "./types";
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
      status: string;
    };
  };
}

interface EditorHandle {
  insertContent: (html: string) => void;
  setContent: (html: string) => void;
  getText: () => string;
  getHTML: () => string;
}

export function CarePlan({
  idPrescription,
  admissionNumber,
}: {
  idPrescription: string;
  admissionNumber: string;
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const open = useSelector(
    (state: RootState) => state.prescriptionv2.carePlan.open,
  );
  const isSaving = useSelector(
    (state: RootState) => state.prescriptionv2.carePlan.status === "loading",
  );
  const carePlanMemory = useSelector(
    (state: any) => state.memoryDraft?.["tpl-care-plan"],
  );
  const prescriptionData = useSelector(
    (state: any) => state.prescriptions.single.data,
  );
  const editorRef = useRef<EditorHandle | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("templates");

  useEffect(() => {
    if (open) dispatch((fetchDraft as any)("tpl-care-plan"));
  }, [open, dispatch]);

  const memoryData = carePlanMemory?.data?.[0]?.value?.data;
  const templates: Template[] = memoryData?.templates ?? [];
  const snippetCategories: SnippetCategory[] = memoryData?.snippets ?? [];
  const baseTemplate: string = templates[0]?.content ?? "";
  const isLoading = carePlanMemory?.status === "loading";
  const isReady = carePlanMemory?.status === "succeeded";
  const isEmpty = isReady && templates.length === 0;

  const handleClose = useCallback(() => {
    dispatch(setCarePlanOpen(false));
    setSearchQuery("");
  }, [dispatch]);

  const insertSnippet = useCallback((text: string) => {
    editorRef.current?.insertContent(text);
  }, []);

  const applyTemplate = useCallback(
    (content: string) => {
      editorRef.current?.setContent(
        processCarePlanTemplate(content, prescriptionData),
      );
      notification.success({ message: t("carePlan.templateApplied") });
    },
    [t, prescriptionData],
  );

  const handleClear = useCallback(() => {
    editorRef.current?.setContent(baseTemplate);
  }, [baseTemplate]);

  const handleSave = useCallback(async () => {
    const text = editorRef.current?.getText() ?? "";

    if (!text.trim()) {
      notification.error({ message: t("carePlan.validationEmpty") });
      return;
    }

    const html = editorRef.current?.getHTML() ?? "";

    const fixedTemplate = [
      {
        group: "Plano de Cuidado",
        questions: [
          {
            id: "care-plan",
            label: "",
            type: "text",
          },
        ],
      },
    ];

    const params = {
      idPrescription: idPrescription,
      admissionNumber: admissionNumber,
      formValues: { "care-plan": html },
      template: fixedTemplate,
      tplName: "Plano de Cuidado",
    };

    const result = await dispatch((createCarePlan as any)(params));

    if (result.error) {
      notification.error({
        message: getErrorMessage(result, t),
      });
      return;
    }

    notification.success({ message: t("carePlan.saveSuccess") });
    handleClose();
  }, [idPrescription, admissionNumber, handleClose, t, dispatch]);

  const filteredCategories = snippetCategories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

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
          {templates.map((tpl) => (
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
                defaultActiveKey={[snippetCategories[0]?.category]}
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
            <Button
              type="primary"
              onClick={handleSave}
              loading={isSaving}
              disabled={isSaving}
            >
              {t("carePlan.btnSave")}
            </Button>
          </div>
        </div>
      }
    >
      <CarePlanLayout>
        <SnippetsPanel>
          <Spin spinning={isLoading}>
            <Tabs
              items={tabItems}
              size="small"
              activeKey={activeTab}
              onChange={setActiveTab}
            />
          </Spin>
        </SnippetsPanel>

        <EditorPanel>
          {isEmpty && (
            <Alert
              type="warning"
              showIcon
              description="Nenhum modelo configurado. Acesse Configurações → Memória para configurar os modelos de plano de cuidado."
              style={{ marginBottom: 12 }}
            />
          )}
          <Editor
            ref={editorRef}
            content={baseTemplate}
            onEdit={() => {}}
            utilities={["basic"]}
          />
        </EditorPanel>
      </CarePlanLayout>
    </DefaultModal>
  );
}
