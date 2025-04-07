import React, { useState, useRef, useEffect } from "react";
import { isEmpty } from "lodash";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { QuestionOutlined, FullscreenOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";

import LoadBox, { LoadContainer } from "components/LoadBox";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import CustomFormView from "components/Forms/CustomForm/View";
import notification from "components/notification";
import Empty from "components/Empty";
import DefaultModal from "components/Modal";

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
}) {
  const paperContainerRef = useRef(null);
  const menuRef = useRef(null);
  const selectionRangeRef = useRef(null);
  const modalRef = useRef(null);
  const [edit, setEdit] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (saveStatus.success) {
      notification.success({
        message: t("success.generic"),
      });
      setEdit(false);
    }

    if (saveStatus.error) {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [saveStatus, t]);

  useEffect(() => {
    // stop editing on selection change
    setEdit(false);
  }, [selected]);

  const goToHelp = () => {
    window.open(helpLink);
  };

  const annotate = (option) => {
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
      text: paperContainerRef.current.firstChild.innerHTML,
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
        text: paperContainerRef.current.firstChild.innerHTML,
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
          range
        );
        return false;
      }
    }

    return true;
  };

  const selectionChange = () => {
    if (isValidSelection() && !disableSelection) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      const elm = document.createElement("span");
      const content = document.createTextNode(window.getSelection().toString());

      elm.appendChild(content);

      range.deleteContents();
      range.insertNode(elm);

      selectionRangeRef.current = range;

      const modal = DefaultModal.info({
        title: "Anotar evolução",
        content: null,
        icon: null,
        width: 500,
        okText: "Fechar",
        okButtonProps: { type: "default" },
        wrapClassName: "default-modal",
      });

      modal.update({
        content: (
          <>
            <div>Texto anotado: {selection.toString()}</div>
            <div>Informe a categoria desta anotação:</div>
            <div>{menu()}</div>
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

  const openPopup = () => {
    const padding = 200;
    const width = Math.round(window.innerWidth - padding);
    const height = Math.round(window.innerHeight - padding);

    const popup = window.open(
      `/prescricao/evolucao/${admissionNumber}`,
      "clinicalNotesPopup",
      `height=${height},width=${width}`
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
    } else {
      html = selected.text.trim();
    }
  }

  html = DOMPurify.sanitize(html, {
    FORBID_ATTR: ["style"],
    FORBID_TAGS: ["font"],
  });

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
                    onClick={() => setEdit(!edit)}
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
        {saveStatus.isSaving ? (
          <LoadContainer>
            <LoadBox $absolute={true} />
          </LoadContainer>
        ) : (
          <>
            {edit ? (
              <Paper $t={t}>
                <Edit
                  clinicalNote={selected}
                  update={update}
                  setEdit={setEdit}
                />
              </Paper>
            ) : (
              <>
                {selected.text && (
                  <>
                    <Paper
                      $t={t}
                      dangerouslySetInnerHTML={{
                        __html: html,
                      }}
                      onMouseUp={(e) => selectionChange(e)}
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
    </>
  );
}
