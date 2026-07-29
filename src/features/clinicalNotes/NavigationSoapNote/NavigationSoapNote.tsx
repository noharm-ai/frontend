import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Alert, Collapse, Empty, Input, Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";

import DefaultModal from "components/Modal";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import EditorBase from "components/Editor";
import CustomFormView from "components/Forms/CustomForm/View";
import { getErrorMessage } from "src/utils/errorHandler";
import { fetchDraft } from "features/memory/MemoryDraft/MemoryDraftSlice";
import type { SnippetCategory } from "features/prescription/CarePlan/types";
import { fetchClinicalNotesListThunk } from "store/ducks/clinicalNotes/thunk";
import {
  closeNavigationSoapNote,
  generateNavigationSoapNote,
  saveNavigationSoapNote,
} from "./NavigationSoapNoteSlice";
import {
  SourceBox,
  EditorWrapper,
  SnippetsPanel,
  SearchWrapper,
  SnippetButton,
} from "./NavigationSoapNote.style";

const Editor = EditorBase as any;
const SOAP_TPL_NAME = "Evolução Farmacêutica - SOAP";
const SNIPPETS_MEMORY_TYPE = "tpl-care-plan";

interface EditorHandle {
  insertContent: (html: string) => void;
  setContent: (html: string) => void;
  getText: () => string;
  getHTML: () => string;
}

export function NavigationSoapNote() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const note = useSelector((state: any) => state.navigationSoapNote.note);
  const sourceContent = note?.sourceContent;
  const generate = useSelector(
    (state: any) => state.navigationSoapNote.generate,
  );
  const isSaving = useSelector(
    (state: any) => state.navigationSoapNote.save.status === "loading",
  );
  const snippetsMemory = useSelector(
    (state: any) => state.memoryDraft?.[SNIPPETS_MEMORY_TYPE],
  );
  const editorRef = useRef<EditorHandle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const snippetCategories: SnippetCategory[] =
    snippetsMemory?.data?.[0]?.value?.data?.snippets ?? [];
  const snippetsLoading = snippetsMemory?.status === "loading";

  useEffect(() => {
    if (note) {
      dispatch((fetchDraft as any)(SNIPPETS_MEMORY_TYPE));
    }
  }, [note, dispatch]);

  const insertSnippet = useCallback((text: string) => {
    editorRef.current?.insertContent(text);
  }, []);

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
            title={t("navigationSoapNote.insertHint")}
            placement="left"
          >
            <SnippetButton type="button" onClick={() => insertSnippet(item.text)}>
              {item.title}
            </SnippetButton>
          </Tooltip>
        ))}
      </>
    ),
  }));

  const generateNote = useCallback(
    (id: string) => {
      dispatch(generateNavigationSoapNote({ id }) as any).then(
        (result: any) => {
          if (result.error) {
            notification.error({ message: getErrorMessage(result, t) });
          }
        },
      );
    },
    [dispatch, t],
  );

  useEffect(() => {
    if (note) {
      generateNote(note.id);
    }
  }, [note, generateNote]);

  const handleClose = () => {
    dispatch(closeNavigationSoapNote());
    setSearchQuery("");
  };

  const handleSave = async () => {
    const plainText = editorRef.current?.getText() ?? "";

    if (!plainText.trim()) {
      notification.error({ message: t("navigationSoapNote.validationEmpty") });
      return;
    }

    const fixedTemplate = [
      {
        group: "Plano de Cuidado",
        questions: [
          {
            id: "care-plan-soap",
            label: "",
            type: "text",
          },
        ],
      },
    ];

    const params = {
      admissionNumber: note.admissionNumber,
      tplName: SOAP_TPL_NAME,
      template: fixedTemplate,
      formValues: { "care-plan-soap": editorRef.current?.getHTML() ?? "" },
    };

    const result: any = await dispatch(saveNavigationSoapNote(params) as any);

    if (result.error) {
      notification.error({ message: getErrorMessage(result, t) });
      return;
    }

    notification.success({ message: t("navigationSoapNote.saveSuccess") });
    handleClose();
    dispatch(fetchClinicalNotesListThunk(note.admissionNumber) as any);
  };

  return (
    <DefaultModal
      title={t("navigationSoapNote.title")}
      open={!!note}
      onCancel={handleClose}
      width="85vw"
      centered
      destroyOnHidden
      maskClosable={false}
      styles={{
        body: {
          height: "70vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {generate.status === "succeeded" && (
            <Button
              icon={<ReloadOutlined />}
              onClick={() => note && generateNote(note.id)}
              style={{ marginRight: "auto" }}
            >
              {t("navigationSoapNote.btnRegenerate")}
            </Button>
          )}
          <Button onClick={handleClose}>
            {t("navigationSoapNote.btnCancel")}
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving || generate.status !== "succeeded"}
          >
            {t("navigationSoapNote.btnSave")}
          </Button>
        </div>
      }
    >
      {generate.status === "succeeded" && (
        <Alert
          type="info"
          showIcon
          message={t("navigationSoapNote.editHint")}
          style={{ marginBottom: "12px", flex: "0 0 auto" }}
        />
      )}

      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: 12 }}>
            {t("navigationSoapNote.sourceTitle")}
          </h4>
          <SourceBox>
            {sourceContent?.html ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(sourceContent.html),
                }}
              />
            ) : sourceContent?.template ? (
              <CustomFormView
                template={sourceContent.template}
                values={sourceContent.form}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("navigationSoapNote.sourceEmpty")}
              />
            )}
          </SourceBox>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: 12 }}>
            {t("navigationSoapNote.generatedTitle")}
          </h4>

          {generate.status === "loading" && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Spin size="large" />
              <div style={{ marginTop: "16px" }}>
                {t("navigationSoapNote.generating")}
              </div>
            </div>
          )}

          {generate.status === "failed" && (
            <Alert
              type="error"
              showIcon
              message={t("navigationSoapNote.generateError")}
              action={
                <Button
                  danger
                  icon={<ReloadOutlined />}
                  onClick={() => note && generateNote(note.id)}
                >
                  {t("navigationSoapNote.btnRegenerate")}
                </Button>
              }
            />
          )}

          {generate.status === "succeeded" && (
            <EditorWrapper>
              <Editor
                ref={editorRef}
                content={generate.text}
                onEdit={() => {}}
                utilities={["basic"]}
              />
            </EditorWrapper>
          )}
        </div>

        {generate.status === "succeeded" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              flex: "0 0 auto",
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: 12 }}>
              {t("navigationSoapNote.snippetsTitle")}
            </h4>
            <SnippetsPanel>
              <SearchWrapper>
                <Input
                  placeholder={t("navigationSoapNote.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  allowClear
                  size="small"
                />
              </SearchWrapper>
              <div className="panel-scroll">
                {snippetsLoading ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <Spin />
                  </div>
                ) : collapseItems.length > 0 ? (
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
                    {t("navigationSoapNote.noResults")}
                  </div>
                )}
              </div>
            </SnippetsPanel>
          </div>
        )}
      </div>
    </DefaultModal>
  );
}
