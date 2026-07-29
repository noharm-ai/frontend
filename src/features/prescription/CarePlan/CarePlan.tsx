import React, { useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Alert, Collapse, Drawer, Input, List, Select, Spin, Tabs } from "antd";
import {
  ClearOutlined,
  FileTextOutlined,
  HistoryOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import DefaultModal from "components/Modal";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Badge from "components/Badge";
import Empty from "components/Empty";
import notification from "components/notification";
import EditorBase from "components/Editor";
const Editor = EditorBase as any;
import {
  setCarePlanOpen,
  createCarePlan,
} from "features/prescription/PrescriptionSlice";
import { fetchDraft } from "features/memory/MemoryDraft/MemoryDraftSlice";
import { getErrorMessage } from "src/utils/errorHandler";
import {
  saveEntry,
  getEntries,
  type HistoryEntry,
} from "utils/clinicalNotesHistory";
import { formatDateTime } from "utils/date";
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

// Isolate care-plan drafts into their own history bucket so they neither
// pollute nor collide with the clinical-notes custom-form drafts.
const DRAFT_SCOPE = "carePlan";
const DRAFT_DEBOUNCE_MS = 1500;
const MAX_DRAFTS = 5;
const DEFAULT_TPL_NAME = "Plano de Cuidado";

const FIXED_TEMPLATE = [
  {
    group: DEFAULT_TPL_NAME,
    questions: [
      {
        id: "care-plan",
        label: "",
        type: "text",
      },
    ],
  },
];

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("texts");
  const [selectedTplName, setSelectedTplName] = React.useState("");
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState(false);
  const [historyEntries, setHistoryEntries] = React.useState<HistoryEntry[]>(
    () => getEntries(DRAFT_SCOPE),
  );

  useEffect(() => {
    if (open) dispatch((fetchDraft as any)("tpl-care-plan"));
  }, [open, dispatch]);

  // Clear any pending draft-save timer on unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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

  // Auto-save a local draft as the user types (debounced), so poor
  // connections don't cost them their work. `html` is null when the editor
  // is emptied — skip those so we never persist an empty draft.
  const handleEdit = useCallback(
    (html: string | null) => {
      if (!html) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveEntry(
          {
            tplName: selectedTplName || templates[0]?.title || DEFAULT_TPL_NAME,
            templateData: FIXED_TEMPLATE,
            admissionNumber: admissionNumber,
            idPrescription: Number(idPrescription),
            formValues: { "care-plan": html },
          },
          DRAFT_SCOPE,
          MAX_DRAFTS,
        );
        setHistoryEntries(getEntries(DRAFT_SCOPE));
      }, DRAFT_DEBOUNCE_MS);
    },
    [selectedTplName, templates, admissionNumber, idPrescription],
  );

  const handleOpenHistory = useCallback(() => {
    setHistoryEntries(getEntries(DRAFT_SCOPE));
    setHistoryDrawerOpen(true);
  }, []);

  const handleRestoreEntry = useCallback(
    (entry: HistoryEntry) => {
      const html = (entry.formValues?.["care-plan"] as string) ?? "";
      editorRef.current?.setContent(html);
      setSelectedTplName(entry.tplName);
      setHistoryDrawerOpen(false);
      notification.success({ message: t("carePlan.draftRestored") });
    },
    [t],
  );

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

    const params = {
      idPrescription: idPrescription,
      admissionNumber: admissionNumber,
      formValues: { "care-plan": html },
      template: FIXED_TEMPLATE,
      tplName: selectedTplName || DEFAULT_TPL_NAME,
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

  const admissionEntries = historyEntries.filter(
    (e) => e.admissionNumber === admissionNumber,
  );

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
          <div style={{ display: "flex", gap: 8 }}>
            <Button danger ghost onClick={handleClear} icon={<ClearOutlined />}>
              {t("carePlan.btnClear")}
            </Button>
            <Tooltip title={t("carePlan.historyHint")}>
              <Badge count={admissionEntries.length} size="small">
                <Button
                  icon={<HistoryOutlined />}
                  onClick={handleOpenHistory}
                >
                  {t("carePlan.btnHistory")}
                </Button>
              </Badge>
            </Tooltip>
          </div>
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
            onEdit={handleEdit}
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

      <Drawer
        title={t("carePlan.historyTitle")}
        placement="right"
        width={420}
        onClose={() => setHistoryDrawerOpen(false)}
        open={historyDrawerOpen}
        destroyOnHidden
      >
        {admissionEntries.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("carePlan.historyEmpty")}
          />
        ) : (
          <List itemLayout="horizontal">
            {admissionEntries.map((entry) => (
              <List.Item
                key={entry.id}
                actions={[
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleRestoreEntry(entry)}
                  >
                    {t("carePlan.btnRestore")}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={entry.tplName}
                  description={
                    <>
                      <div>
                        {t("carePlan.historyAdmission")}: {entry.admissionNumber}
                      </div>
                      <div>
                        {formatDateTime(
                          new Date(entry.timestamp).toISOString(),
                        )}
                      </div>
                    </>
                  }
                />
              </List.Item>
            ))}
          </List>
        )}
      </Drawer>
    </DefaultModal>
  );
}
