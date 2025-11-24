import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import "styled-components";
import { isEmpty } from "lodash";
import { useFormikContext } from "formik";
import dayjs from "dayjs";
import {
  SettingOutlined,
  DownloadOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { formatDate } from "utils/date";

import { Textarea, Select, DatePicker } from "components/Inputs";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import {
  CLINICAL_NOTES_STORE_ID,
  CLINICAL_NOTES_MEMORY_TYPE,
  CLINICAL_NOTES_PRIVATE_STORE_ID,
  CLINICAL_NOTES_PRIVATE_MEMORY_TYPE,
} from "utils/memory";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

import MemoryText from "containers/MemoryText";
import MemoryDraft from "features/memory/MemoryDraft/MemoryDraft";
import { getUserLastClinicalNotes } from "features/serverActions/ServerActionsSlice";

import getInterventionTemplate from "./util/getInterventionTemplate";
import { EditorBox } from "../Form.style";
import { getCustomClinicalNote } from "./util/customTemplate";

export default function Base({ prescription, account, signature, action }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const [loadingCopy, setLoadingCopy] = useState(false);
  const { notes, concilia, date, notesType } = values;

  const clinicalNotesTypeOptions = (
    prescription.data.clinicalNotesTypes || []
  ).map((cnType) => ({
    label: cnType.name,
    value: cnType.id,
  }));

  const loadDefaultText = () => {
    setFieldValue(
      "notes",
      getInterventionTemplate(prescription, account, signature, concilia)
    );
  };

  const openUserConfig = () => {
    window.open("/configuracoes/usuario");
  };

  const disabledDate = (current) => {
    return current && current < dayjs().subtract(1, "days").endOf("day");
  };

  const loadNote = (clinicalNote) => {
    setFieldValue(
      "notes",
      getCustomClinicalNote(
        prescription,
        clinicalNote,
        { signature, account },
        t
      )
    );
  };

  const loadLastNote = () => {
    setLoadingCopy(true);
    dispatch(
      getUserLastClinicalNotes({
        admissionNumber: values.admissionNumber,
      })
    ).then((response) => {
      setLoadingCopy(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        if (response.payload.data) {
          setFieldValue(
            "notes",
            `---Cópia do dia: ${formatDate(response.payload.data?.date)}\n\n${
              response.payload.data?.text
            }`
          );

          notification.success({
            message: "Última evolução copiada com sucesso",
          });
        } else {
          notification.error({
            message: "Não encontramos evolução para este atendimento",
          });
        }
      }
    });
  };

  return (
    <>
      {prescription.data.concilia && (
        <div
          className={`form-row ${
            errors.concilia && touched.concilia ? "error" : ""
          }`}
        >
          <div className="form-label">
            <label>
              <Tooltip title="Informe o tipo desta conciliação">Tipo:</Tooltip>
            </label>
          </div>
          <div className="form-input">
            <Select
              placeholder="Selecione o tipo de conciliação"
              onChange={(value) => setFieldValue("concilia", value)}
              value={concilia}
              identify="concilia"
              allowClear
              style={{ minWidth: "300px" }}
              status={errors.concilia && touched.concilia ? "error" : null}
            >
              <Select.Option value="b" key="b">
                Admissão
              </Select.Option>
              <Select.Option value="a" key="a">
                Alta
              </Select.Option>
              <Select.Option value="n" key="n">
                Não realizada
              </Select.Option>
              <Select.Option value="t" key="t">
                Transferência
              </Select.Option>
            </Select>
          </div>
          {errors.concilia && (
            <div className="form-error">{errors.concilia}</div>
          )}
        </div>
      )}
      {!prescription.data.concilia &&
        prescription.data.clinicalNotesTypes?.length > 0 && (
          <div className={`form-row ${errors.notesType ? "error" : ""}`}>
            <div className="form-label">
              <label>
                <Tooltip title="Informe o tipo desta evolução">Tipo:</Tooltip>
              </label>
            </div>
            <div className="form-input">
              <Select
                placeholder="Selecione o tipo de evolução"
                onChange={(value) => setFieldValue("notesType", value)}
                value={notesType}
                identify="notesType"
                allowClear
                style={{ minWidth: "300px" }}
                status={errors.notesType ? "error" : null}
                options={clinicalNotesTypeOptions}
              />
            </div>
            {errors.notesType && (
              <div className="form-error">{errors.notesType}</div>
            )}
          </div>
        )}
      {action === "schedule" && (
        <div
          className={`form-row ${errors.date && touched.date ? "error" : ""}`}
        >
          <div className="form-label">
            <label>Data da consulta:</label>
          </div>
          <div className="form-input">
            <DatePicker
              format="DD/MM/YYYY HH:mm"
              value={date ? dayjs(date) : null}
              onChange={(value) =>
                setFieldValue("date", value.format("YYYY-MM-DDTHH:mm:00"))
              }
              popupClassName="noArrow"
              allowClear={false}
              disabledDate={disabledDate}
              showTime
              status={errors.date && touched.date ? "error" : null}
            />
          </div>
          {errors.date && <div className="form-error">{errors.date}</div>}
        </div>
      )}

      <div
        className={`form-row ${errors.notes && touched.notes ? "error" : ""}`}
      >
        <div className="form-label-actions">
          <label>Evolução:</label>
          <div>
            {action !== "schedule" && (
              <>
                <Tooltip title="Aplicar evolução modelo">
                  <Button
                    shape="circle"
                    icon={<DownloadOutlined />}
                    onClick={loadDefaultText}
                    type="primary"
                    className="gtm-bt-clinicalNotes-applyDefaultText"
                    style={{ marginRight: "5px" }}
                  />
                </Tooltip>
                <Tooltip title="Copiar última evolução">
                  <Button
                    shape="circle"
                    icon={<CopyOutlined />}
                    onClick={loadLastNote}
                    type="primary"
                    style={{ marginRight: "5px" }}
                    loading={loadingCopy}
                  />
                </Tooltip>
              </>
            )}
            <MemoryText
              storeId={CLINICAL_NOTES_STORE_ID}
              memoryType={CLINICAL_NOTES_MEMORY_TYPE}
              content={notes}
              onLoad={(value) => loadNote(value)}
            />
            <span style={{ marginLeft: "5px" }}>
              <MemoryText
                storeId={CLINICAL_NOTES_PRIVATE_STORE_ID}
                memoryType={CLINICAL_NOTES_PRIVATE_MEMORY_TYPE}
                privateMemory={true}
                content={notes}
                onLoad={(value) => loadNote(value)}
              />
            </span>
            {(isEmpty(signature.list) || signature.list[0].value === "") && (
              <Tooltip title="Configurar assinatura padrão">
                <Button
                  shape="circle"
                  icon={<SettingOutlined />}
                  onClick={openUserConfig}
                  type="primary"
                  className="gtm-bt-clinicalNotes-configDefaultText"
                  style={{ marginLeft: "5px" }}
                />
              </Tooltip>
            )}
          </div>
        </div>
        <div className="form-input">
          <EditorBox>
            <Textarea
              autoFocus
              value={notes}
              onChange={({ target }) => setFieldValue("notes", target.value)}
              style={{ minHeight: "60vh" }}
              status={errors.notes && touched.notes ? "error" : null}
            />
            {errors.notes && <div className="form-error">{errors.notes}</div>}
            <MemoryDraft
              type={`draft_cn_${values.idPrescription}`}
              currentValue={values.notes}
              setValue={(value) => setFieldValue("notes", value)}
            ></MemoryDraft>
          </EditorBox>
        </div>
      </div>
    </>
  );
}
