import React, { useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Alert, Collapse, Input, Select, Spin, Tabs } from "antd";
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
  const userSignature = useSelector(
    (state: any) => state.user.account.signature,
  );
  const editorRef = useRef<EditorHandle | null>(null);
  const savingRef = useRef(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("texts");
  const [selectedTplName, setSelectedTplName] = React.useState("");
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);

  useEffect(() => {
    if (open) dispatch((fetchDraft as any)("tpl-care-plan"));
  }, [open, dispatch]);

  const memoryData = carePlanMemory?.data?.[0]?.value?.data;
  const templates: Template[] = React.useMemo(
    () => memoryData?.templates ?? [],
    [memoryData],
  );
  const snippetCategories: SnippetCategory[] = memoryData?.snippets ?? [];
  const baseTemplate: string = templates[0]?.content ?? "";
  const isLoading = carePlanMemory?.status === "loading";
  const isReady = carePlanMemory?.status === "succeeded";
  const isEmpty = isReady && templates.length === 0;

  useEffect(() => {
    if (open && isReady && editorRef.current) {
      editorRef.current.setContent(
        processCarePlanTemplate(baseTemplate, prescriptionData, userSignature),
      );
    }
  }, [open, isReady, baseTemplate, prescriptionData, userSignature]);

  const handleClose = useCallback(() => {
    dispatch(setCarePlanOpen(false));
    setSearchQuery("");
    setSelectedTplName("");
    setSaveDialogOpen(false);
  }, [dispatch]);

  const insertSnippet = useCallback((text: string) => {
    editorRef.current?.insertContent(text);
  }, []);

  const applyTemplate = useCallback(
    (tpl: Template) => {
      editorRef.current?.setContent(
        processCarePlanTemplate(tpl.content, prescriptionData, userSignature),
      );
      // Remember the applied template so the save dialog defaults to it.
      setSelectedTplName(tpl.title);
      notification.success({ message: t("carePlan.templateApplied") });
    },
    [t, prescriptionData, userSignature],
  );

  const handleClear = useCallback(() => {
    editorRef.current?.setContent("");
  }, []);

  const handleSaveClick = useCallback(() => {
    const text = editorRef.current?.getText() ?? "";

    if (!text.trim()) {
      notification.error({ message: t("carePlan.validationEmpty") });
      return;
    }

    // Seed the document type with the first template's name when opening the
    // dialog (an event, not a render) so the user has a sensible default.
    setSelectedTplName((prev) => prev || templates[0]?.title || "");
    setSaveDialogOpen(true);
  }, [t, templates]);

  const handleConfirmSave = useCallback(async () => {
    // Guard against duplicate submissions: a synchronous ref blocks re-entry
    // even before Redux `isSaving` re-renders the button (e.g. rapid clicks
    // on slow connections).
    if (savingRef.current) return;

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
      tplName: selectedTplName || "Plano de Cuidado",
    };

    savingRef.current = true;
    try {
      const result = await dispatch((createCarePlan as any)(params));

      if (result.error) {
        notification.error({
          message: getErrorMessage(result, t),
        });
        return;
      }

      notification.success({ message: t("carePlan.saveSuccess") });
      handleClose();
    } finally {
      savingRef.current = false;
    }
  }, [
    idPrescription,
    admissionNumber,
    selectedTplName,
    handleClose,
    t,
    dispatch,
  ]);

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
              <TemplateButton type="button" onClick={() => applyTemplate(tpl)}>
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
              onClick={handleSaveClick}
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

      <DefaultModal
        title={t("carePlan.documentType")}
        open={saveDialogOpen}
        onCancel={() => setSaveDialogOpen(false)}
        confirmLoading={isSaving}
        okText={t("carePlan.btnSave")}
        cancelText={t("carePlan.btnCancel")}
        onOk={handleConfirmSave}
        okButtonProps={{ disabled: !selectedTplName }}
        centered
        destroyOnHidden
      >
        <p>
          Confirme o tipo de documento que será criado. Esta informação será
          exibida na lista de evoluções para ajudar a identificar este
          documento.
        </p>
        <Select
          value={selectedTplName || undefined}
          onChange={setSelectedTplName}
          options={templates.map((tpl) => ({
            value: tpl.title,
            label: tpl.title,
          }))}
          style={{ width: "100%" }}
          placeholder={t("carePlan.documentTypePlaceholder")}
        />
      </DefaultModal>
    </DefaultModal>
  );
}
