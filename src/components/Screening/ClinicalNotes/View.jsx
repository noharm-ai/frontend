import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "lodash";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  QuestionOutlined,
  FullscreenOutlined,
  PrinterOutlined,
  FileTextOutlined,
  EyeInvisibleOutlined,
  SignatureOutlined,
} from "@ant-design/icons";
import DOMPurify from "dompurify";

import LoadBox, { LoadContainer } from "components/LoadBox";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import CustomFormView from "components/Forms/CustomForm/View";
import notification from "components/notification";
import Empty from "components/Empty";
import DefaultModal from "components/Modal";
import Alert from "components/Alert";

import PermissionService from "src/services/PermissionService";
import Permission from "src/models/Permission";
import { getMemory } from "features/lists/ListsSlice";
import { clearDraft } from "utils/clinicalNotesEditDraft";
import { NavigationSoapNote } from "features/clinicalNotes/NavigationSoapNote/NavigationSoapNote";
import { openNavigationSoapNote } from "features/clinicalNotes/NavigationSoapNote/NavigationSoapNoteSlice";
import { DigitalSignature } from "features/clinicalNotes/DigitalSignature/DigitalSignature";
import { openDigitalSignature } from "features/clinicalNotes/DigitalSignature/DigitalSignatureSlice";

import Edit from "./Edit";
import ClinicalNotesIndicator from "./ClinicalNotesIndicator";
import {
  Paper,
  PaperHeader,
  PaperContainer,
  MenuPopup,
  Legend,
} from "./index.style";

const helpLink = `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/113`;

export default function View({
  selected,
  update,
  userId,
  featureService,
  saveStatus,
  popup,
  admissionNumber,
  disableSelection = false,
  selectedIndicators,
  edit = false,
  setEdit = () => {},
}) {
  const dispatch = useDispatch();
  const paperContainerRef = useRef(null);
  const paperRef = useRef(null);
  const menuRef = useRef(null);
  const selectionRangeRef = useRef(null);
  const selectionElementRef = useRef(null);
  const modalRef = useRef(null);
  const [prevSelected, setPrevSelected] = useState(selected);
  const [prevSaveStatus, setPrevSaveStatus] = useState(saveStatus);
  const { t } = useTranslation();

  if (prevSelected !== selected) {
    setPrevSelected(selected);
    setEdit(false);
  }

  if (saveStatus.success && !prevSaveStatus.success) {
    setPrevSaveStatus(saveStatus);
    if (selected?.id) clearDraft(selected.id);
    setEdit(false);
  }

  useEffect(() => {
    if (saveStatus.success) {
      notification.success({
        message: t("success.generic"),
      });
    }

    if (saveStatus.error) {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [saveStatus, t]);

  const goToHelp = () => {
    window.open(helpLink);
  };

  // evoluções originadas de prescrição não podem ser anotadas
  const isPrescriptionSource = () => selected?.source === "prescription";
  const canAnnotate = () => !disableSelection && !isPrescriptionSource();

  const annotate = (option) => {
    if (!canAnnotate()) return;

    const range = selectionRangeRef.current;
    const elm = document.createElement("span");
    const close = document.createElement("a");
    const content = document.createTextNode(range.toString());

    close.setAttribute("class", "close-btn");
    close.appendChild(document.createTextNode("X"));

    elm.setAttribute("class", `annotation annotation-${option.key}`);
    elm.setAttribute("update_by", userId);
    elm.appendChild(content);
    elm.appendChild(close);

    range.deleteContents();
    range.insertNode(elm);

    modalRef.current?.destroy();

    update({
      id: selected.id,
      text: paperRef.current.innerHTML,
    });
  };

  const redact = () => {
    if (!update || !canAnnotate()) return;

    const elm = selectionElementRef.current;
    if (!elm) return;

    DefaultModal.confirm({
      title: "Remover informação sensível",
      content: (
        <>
          <p>
            O texto <strong>{elm.innerText}</strong> será substituído por{" "}
            <strong>***</strong> nesta evolução.
          </p>
          <p>Esta ação não pode ser desfeita. Deseja continuar?</p>
        </>
      ),
      okText: "Sim, remover",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: () => {
        elm.replaceWith(document.createTextNode("***"));
        selectionElementRef.current = null;

        modalRef.current?.destroy();

        update({
          id: selected.id,
          text: paperRef.current.innerHTML,
        });
      },
    });
  };

  const removeAnnotation = (e) => {
    const el = e.target.closest("SPAN");
    if (el && e.target.className === "close-btn") {
      if (!update) {
        notification.error({
          message:
            "Remoção de anotações devem ser efetuadas na interface de acompanhamento de evoluções",
        });
        return;
      }

      el.removeChild(el.getElementsByClassName("close-btn")[0]);
      el.replaceWith(document.createTextNode(el.innerText));
      update({
        id: selected.id,
        text: paperRef.current.innerHTML,
      });
    }
  };

  const isValidSelection = () => {
    const selection = window.getSelection();

    if (selection.toString() === "") return false;

    if (selection.focusNode.nodeName !== "#text") return false;

    const range = selection.getRangeAt(0);

    if (range.cloneContents().querySelectorAll("span").length) {
      return false;
    }

    if (range.commonAncestorContainer.offsetParent !== undefined) {
      const { className } = range.commonAncestorContainer.offsetParent;
      if (
        !className.includes("Paper-") &&
        !className.includes("PaperContainer")
      ) {
        console.error(
          "invalid selection",
          range.commonAncestorContainer.offsetParent.className,
          range,
        );
        return false;
      }
    }

    return true;
  };

  const selectionChange = () => {
    if (canAnnotate() && isValidSelection()) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      const elm = document.createElement("span");
      const content = document.createTextNode(window.getSelection().toString());

      elm.appendChild(content);

      range.deleteContents();
      range.insertNode(elm);

      selectionRangeRef.current = range;
      selectionElementRef.current = elm;

      const modal = DefaultModal.info({
        title: "Anotar evolução",
        content: null,
        icon: null,
        width: 500,
        okText: "Fechar",
        okButtonProps: { type: "default" },
        mask: { blur: false },
        wrapClassName: "default-modal",
      });

      modal.update({
        content: (
          <>
            <div>Texto anotado: {selection.toString()}</div>
            <div>Informe a categoria desta anotação:</div>
            <div>{menu()}</div>
            {update && (
              <div style={{ marginTop: "1rem" }}>
                <div>Ou remova esta informação da evolução:</div>
                <Button
                  danger
                  icon={<EyeInvisibleOutlined />}
                  style={{ marginTop: "0.5rem" }}
                  onClick={redact}
                >
                  Substituir por ***
                </Button>
              </div>
            )}
          </>
        ),
      });

      modalRef.current = modal;
    }
  };

  const menuOptions = () => {
    const items = ClinicalNotesIndicator.list(t)
      .filter((t) => t.value === "nomes")
      .map((i) => ({
        key: i.value,
        id: "gtm-indicator",
        label: (
          <>
            <div className="avatar" style={{ backgroundColor: i.color }} />{" "}
            {i.label}
          </>
        ),
      }));

    return items;
  };

  const menu = () => {
    return (
      <div ref={menuRef}>
        <MenuPopup
          theme="dark"
          selectable={false}
          items={menuOptions()}
          onClick={(k) => annotate(k)}
        ></MenuPopup>
      </div>
    );
  };

  const printNote = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      notification.error({ message: "Desative o bloqueador de popups" });
      return;
    }

    dispatch(getMemory({ type: "nav-header" })).then((result) => {
      const navHeaderText = result.payload?.data?.[0]?.value?.header ?? "";
      const noteHeader = `${format(parseISO(selected.date), "dd/MM/yyyy HH:mm")} — ${selected.prescriber}`;
      const content = paperContainerRef.current?.innerHTML ?? "";
      const styles = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]'),
      )
        .map((el) => el.outerHTML)
        .join("\n");

      printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Evolução — ${noteHeader}</title>
    ${styles}
    <style>
      @page { margin: 24px; }
      body { padding: 24px; }
      * { max-height: none !important; overflow: visible !important; }
      a.close-btn { display: none; }
      .print-institution-header {
        display: flex; flex-direction: column; align-items: center;
        text-align: center; border-bottom: 1px solid #ccc;
        padding-bottom: 12px; margin-bottom: 12px;
      }
      .print-institution-header p { margin: 0; font-size: 13px; }
      .print-note-header { font-size: 14px; font-weight: bold; margin-bottom: 12px; margin-top: 30px; }
      h2 { break-after: avoid; page-break-after: avoid; }
      p { orphans: 3; widows: 3; }
    </style>
  </head>
  <body>
    <div class="print-institution-header">
      <img src="/logo512.png" style="width:30px;margin-bottom:8px" alt="NoHarm.ai" />
      ${navHeaderText}
    </div>
    ${content}
    <script>window.onload = function() { window.print(); window.close(); }</script>
  </body>
</html>`);
      printWindow.document.close();
    });
  };

  const openPopup = () => {
    const padding = 200;
    const width = Math.round(window.innerWidth - padding);
    const height = Math.round(window.innerHeight - padding);

    const popup = window.open(
      `/prescricao/evolucao/${admissionNumber}`,
      "clinicalNotesPopup",
      `height=${height},width=${width}`,
    );

    if (!popup) {
      notification.error({
        message: "Desative o bloqueador de popups",
      });
    }
  };

  if (isEmpty(selected)) return null;

  let html = "";

  if (selected.text) {
    if (featureService.hasPrimaryCare()) {
      html = selected.text.trim().replaceAll("\n", "<br/>");
    } else if (featureService.hasClinicalNotesLegacyFormat()) {
      html = selected.text.trim().replaceAll("  ", "<br/>");
    } else if (selected.source === "prescription") {
      html = selected.text.trim().replaceAll("\n", "<br/>");
    } else {
      html = selected.text.trim();
    }
  }

  html = DOMPurify.sanitize(html, {
    FORBID_ATTR: ["style"],
    FORBID_TAGS: ["font", "img"],
  });

  const canGenerateSoap = (selected.position || "").includes("Consulta");

  return (
    <>
      <PaperHeader>
        <div className="line">
          <div className="info">
            {format(parseISO(selected.date), "dd/MM/yyyy HH:mm")} -{" "}
            <span className="name">{selected.prescriber}</span>
          </div>
          <div className="help">
            <>
              {!edit &&
                selected.source !== "prescription" &&
                PermissionService().has(Permission.READ_NAV) && (
                  <Tooltip
                    title={
                      canGenerateSoap
                        ? t("navigationSoapNote.btnGenerate")
                        : t("navigationSoapNote.btnGenerateDisabled")
                    }
                  >
                    <Button
                      type="primary"
                      ghost
                      shape="circle"
                      className="gtm-bt-soap-generate"
                      disabled={!canGenerateSoap}
                      icon={<FileTextOutlined />}
                      style={{
                        width: "28px",
                        height: "28px",
                        minWidth: "28px",
                        marginRight: "10px",
                      }}
                      onClick={() =>
                        dispatch(
                          openNavigationSoapNote({
                            id: selected.id,
                            admissionNumber:
                              selected.admissionNumber || admissionNumber,
                            sourceContent: {
                              html,
                              template: selected.template,
                              form: selected.form,
                            },
                          }),
                        )
                      }
                    />
                  </Tooltip>
                )}
              {!edit &&
                (selected.text || selected.template) &&
                PermissionService().has(Permission.READ_NAV) && (
                  <Tooltip title="Imprimir">
                    <Button
                      type="primary"
                      ghost
                      shape="circle"
                      icon={<PrinterOutlined />}
                      style={{
                        width: "28px",
                        height: "28px",
                        minWidth: "28px",
                        marginRight: "10px",
                      }}
                      onClick={printNote}
                    />
                  </Tooltip>
                )}
              {!edit &&
                selected.source !== "prescription" &&
                (selected.text || selected.template) &&
                PermissionService().has(Permission.READ_NAV) && (
                  <Tooltip title={t("digitalSignature.btnTooltip")}>
                    <Button
                      type="primary"
                      ghost
                      shape="circle"
                      icon={<SignatureOutlined />}
                      style={{
                        width: "28px",
                        height: "28px",
                        minWidth: "28px",
                        marginRight: "10px",
                      }}
                      onClick={() =>
                        dispatch(
                          openDigitalSignature({
                            id: selected.id,
                            idSignRequest: selected.idSignRequest ?? null,
                          }),
                        )
                      }
                    />
                  </Tooltip>
                )}
              {!popup && admissionNumber && (
                <Tooltip title="Abrir em nova janela">
                  <Button
                    type="primary"
                    className="gtm-clinicalnote-btn-popup"
                    shape="circle"
                    ghost
                    icon={<FullscreenOutlined />}
                    style={{
                      width: "28px",
                      height: "28px",
                      minWidth: "28px",
                      marginRight: "10px",
                    }}
                    onClick={openPopup}
                  />
                </Tooltip>
              )}
              {featureService.hasPrimaryCare() ? (
                <>
                  <Button
                    type="primary"
                    className="gtm-clinicalnote-edit"
                    ghost={edit}
                    onClick={() => {
                      if (edit && selected?.id) clearDraft(selected.id);
                      setEdit(!edit);
                    }}
                  >
                    {edit ? "Cancelar" : "Editar"}
                  </Button>
                </>
              ) : (
                <Tooltip title={t("layout.help")}>
                  <Button
                    type="primary"
                    className="gtm-annotation-btn-help"
                    shape="circle"
                    icon={<QuestionOutlined />}
                    style={{
                      width: "28px",
                      height: "28px",
                      minWidth: "28px",
                    }}
                    onClick={goToHelp}
                  />
                </Tooltip>
              )}
            </>
          </div>
        </div>
      </PaperHeader>
      <PaperContainer ref={paperContainerRef} className={edit ? "edit" : ""}>
        {edit ? (
          <Paper $t={t} style={{ position: "relative" }}>
            {saveStatus.isSaving && (
              <LoadBox $absolute={true} style={{ zIndex: 10 }} />
            )}
            <Edit
              clinicalNote={selected}
              update={update}
              setEdit={setEdit}
              isSaving={saveStatus.isSaving}
            />
          </Paper>
        ) : saveStatus.isSaving ? (
          <LoadContainer>
            <LoadBox $absolute={true} />
          </LoadContainer>
        ) : (
          <>
            {selected.text && (
              <>
                {selected.source === "prescription" && (
                  <Alert
                    type="info"
                    message={t("clinicalNotesView.prescriptionSourceAlert", {
                      idPrescription: selected.idPrescription,
                    })}
                    style={{ marginBottom: "12px" }}
                    showIcon
                  />
                )}
                <Paper
                  ref={paperRef}
                  $t={t}
                  $selectedIndicators={selectedIndicators}
                  dangerouslySetInnerHTML={{
                    __html: html,
                  }}
                  onMouseUp={
                    isPrescriptionSource()
                      ? undefined
                      : (e) => selectionChange(e)
                  }
                  onClick={(e) => removeAnnotation(e)}
                  className={`${"annotation-enabled"}`}
                />
              </>
            )}
            {!selected.text && selected.template && (
              <CustomFormView
                template={selected.template}
                values={selected.form}
              />
            )}
            {!selected.text && !selected.template && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhum registro encontrado."
              />
            )}
          </>
        )}
      </PaperContainer>
      {!featureService.hasPrimaryCare() && (
        <>
          <Legend>
            * Nomes presentes na evolução são substituídos por três asteriscos
            (***).
          </Legend>

          <Legend>
            * As anotações são geradas pela <strong>NoHarm Care</strong>.
          </Legend>
        </>
      )}
      <NavigationSoapNote />
      <DigitalSignature />
    </>
  );
}
