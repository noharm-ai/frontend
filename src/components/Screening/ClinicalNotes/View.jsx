import React, { useState, useRef, useEffect } from "react";
import isEmpty from "lodash.isempty";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { QuestionOutlined, FullscreenOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";

import { useOutsideAlerter } from "lib/hooks";
import LoadBox, { LoadContainer } from "components/LoadBox";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import CustomFormView from "components/Forms/CustomForm/View";
import notification from "components/notification";
import Empty from "components/Empty";

import Edit from "./Edit";
import ClinicalNotesIndicator from "./ClinicalNotesIndicator";
import {
  Paper,
  PaperHeader,
  PaperContainer,
  MenuPopup,
  Legend,
} from "./index.style";

const helpLink = `${process.env.REACT_APP_ODOO_LINK}/knowledge/article/113`;

export default function View({
  selected,
  update,
  security,
  userId,
  featureService,
  saveStatus,
  popup,
  admissionNumber,
}) {
  const paperContainerRef = useRef(null);
  const menuRef = useRef(null);
  const [isMenuVisible, setMenuVisibility] = useState(false);
  const [menuPosition, setMenuPosition] = useState({});
  const [selectionRange, setSelectionRange] = useState(null);
  const [edit, setEdit] = useState(false);
  const { t } = useTranslation();

  useOutsideAlerter(menuRef, () => {
    setMenuVisibility(false);
  });

  useEffect(() => {
    if (!isMenuVisible && selectionRange) {
      const textNode = document.createTextNode(selectionRange.toString());
      selectionRange.deleteContents();
      selectionRange.insertNode(textNode);
    }
  }, [isMenuVisible]); //eslint-disable-line

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
    const elm = document.createElement("span");
    const close = document.createElement("a");
    const content = document.createTextNode(selectionRange.toString());

    close.setAttribute("class", "close-btn");
    close.appendChild(document.createTextNode("X"));

    elm.setAttribute("class", `annotation annotation-${option.key}`);
    elm.setAttribute("update_by", userId);
    elm.appendChild(content);
    elm.appendChild(close);

    selectionRange.deleteContents();
    selectionRange.insertNode(elm);

    setSelectionRange(null);
    setMenuVisibility(false);
    update({
      id: selected.id,
      text: paperContainerRef.current.firstChild.innerHTML,
    });
  };

  const removeAnnotation = (e) => {
    const el = e.target.closest("SPAN");
    if (el && e.target.className === "close-btn") {
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
    if (isValidSelection()) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      const elm = document.createElement("span");
      const content = document.createTextNode(window.getSelection().toString());

      elm.appendChild(content);

      range.deleteContents();
      range.insertNode(elm);

      const containerPosition =
        paperContainerRef.current.getBoundingClientRect();
      const menuContainerPosition = menuRef.current.getBoundingClientRect();
      const elmPosition = elm.getBoundingClientRect();

      const top =
        elmPosition.top - containerPosition.top - menuContainerPosition.height;

      setSelectionRange(range);
      setMenuVisibility(true);
      setMenuPosition({
        left: elmPosition.left - containerPosition.left + elmPosition.width,
        top: top < 0 ? -20 : top,
      });
    }
  };

  const menuOptions = () => {
    const items = ClinicalNotesIndicator.list(t).map((i) => ({
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
      <div
        style={{
          position: "absolute",
          top: menuPosition.top,
          left: menuPosition.left,
          visibility: isMenuVisible ? "visible" : "hidden",
        }}
        ref={menuRef}
      >
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
    } else if (featureService.hasClinicalNotesNewFormat()) {
      html = selected.text.trim();
    } else {
      html = selected.text.trim().replaceAll("  ", "<br/>");
    }
  }

  html = DOMPurify.sanitize(html);

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
              {!popup && (
                <Tooltip title="Abrir em nova janela">
                  <Button
                    type="primary gtm-clinicalnote-btn-popup"
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
                    type="primary gtm-clinicalnote-edit"
                    ghost={edit}
                    onClick={() => setEdit(!edit)}
                  >
                    {edit ? "Cancelar" : "Editar"}
                  </Button>
                </>
              ) : (
                <Tooltip title={t("layout.help")}>
                  <Button
                    type="primary gtm-annotation-btn-help"
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
            <LoadBox absolute={true} />
          </LoadContainer>
        ) : (
          <>
            {edit ? (
              <Paper t={t}>
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
                      t={t}
                      dangerouslySetInnerHTML={{
                        __html: html,
                      }}
                      onMouseUp={(e) => selectionChange(e)}
                      onClick={(e) => removeAnnotation(e)}
                      className={`${
                        isMenuVisible ? "disabled" : ""
                      } ${"annotation-enabled"}`}
                    />
                    {menu()}
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
            * As anotações são geradas pela <strong>NoHarm Care</strong>.{" "}
            <a
              href={helpLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Saiba como ajudar"
            >
              Você pode ajudar a treiná-la
            </a>
            .
          </Legend>
        </>
      )}
    </>
  );
}
