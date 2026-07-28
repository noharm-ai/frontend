import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Alert, Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import DefaultModal from "components/Modal";
import Button from "components/Button";
import notification from "components/notification";
import EditorBase from "components/Editor";
import { getErrorMessage } from "src/utils/errorHandler";
import { fetchClinicalNotesListThunk } from "store/ducks/clinicalNotes/thunk";
import { closeSoapNote, generateSoapNote, saveSoapNote } from "./SoapNoteSlice";

const Editor = EditorBase as any;
const SOAP_TPL_NAME = "Evolução Farmacêutica - SOAP";

interface EditorHandle {
  insertContent: (html: string) => void;
  setContent: (html: string) => void;
  getText: () => string;
  getHTML: () => string;
}

export function SoapNote() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const note = useSelector((state: any) => state.soapNote.note);
  const generate = useSelector((state: any) => state.soapNote.generate);
  const isSaving = useSelector(
    (state: any) => state.soapNote.save.status === "loading",
  );
  const editorRef = useRef<EditorHandle | null>(null);

  const generateNote = useCallback(
    (id: string) => {
      dispatch(generateSoapNote({ id }) as any).then((result: any) => {
        if (result.error) {
          notification.error({ message: getErrorMessage(result, t) });
        }
      });
    },
    [dispatch, t],
  );

  useEffect(() => {
    if (note) {
      generateNote(note.id);
    }
  }, [note, generateNote]);

  const handleClose = () => {
    dispatch(closeSoapNote());
  };

  const handleSave = async () => {
    const plainText = editorRef.current?.getText() ?? "";

    if (!plainText.trim()) {
      notification.error({ message: t("soapNote.validationEmpty") });
      return;
    }

    const params = {
      admissionNumber: note.admissionNumber,
      notes: editorRef.current?.getHTML() ?? "",
      tplName: SOAP_TPL_NAME,
    };

    const result: any = await dispatch(saveSoapNote(params) as any);

    if (result.error) {
      notification.error({ message: getErrorMessage(result, t) });
      return;
    }

    notification.success({ message: t("soapNote.saveSuccess") });
    handleClose();
    dispatch(fetchClinicalNotesListThunk(note.admissionNumber) as any);
  };

  return (
    <DefaultModal
      title={t("soapNote.title")}
      open={!!note}
      onCancel={handleClose}
      width="70vw"
      height="90vh"
      centered
      destroyOnHidden
      maskClosable={false}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {generate.status === "succeeded" && (
            <Button
              icon={<ReloadOutlined />}
              onClick={() => note && generateNote(note.id)}
              style={{ marginRight: "auto" }}
            >
              {t("soapNote.btnRegenerate")}
            </Button>
          )}
          <Button onClick={handleClose}>{t("soapNote.btnCancel")}</Button>
          <Button
            type="primary"
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving || generate.status !== "succeeded"}
          >
            {t("soapNote.btnSave")}
          </Button>
        </div>
      }
    >
      {generate.status === "loading" && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>{t("soapNote.generating")}</div>
        </div>
      )}

      {generate.status === "failed" && (
        <Alert
          type="error"
          showIcon
          message={t("soapNote.generateError")}
          action={
            <Button
              danger
              icon={<ReloadOutlined />}
              onClick={() => note && generateNote(note.id)}
            >
              {t("soapNote.btnRegenerate")}
            </Button>
          }
        />
      )}

      {generate.status === "succeeded" && (
        <>
          <Alert
            type="info"
            showIcon
            message={t("soapNote.editHint")}
            style={{ marginBottom: "12px" }}
          />
          <Editor
            ref={editorRef}
            content={generate.text}
            onEdit={() => {}}
            utilities={["basic"]}
          />
        </>
      )}
    </DefaultModal>
  );
}
