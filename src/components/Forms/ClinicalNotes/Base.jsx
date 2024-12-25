import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import "styled-components/macro";
import isEmpty from "lodash.isempty";
import { useFormikContext } from "formik";
import dayjs from "dayjs";
import {
  SettingOutlined,
  DownloadOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { formatDate } from "utils/date";

import { Col } from "components/Grid";
import { Textarea, Select, DatePicker } from "components/Inputs";

import Tooltip from "components/Tooltip";
import Button from "components/Button";
import Heading from "components/Heading";
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
import { Box, EditorBox, FieldError } from "../Form.style";
import { getCustomClinicalNote } from "./util/customTemplate";

export default function Base({
  prescription,
  account,
  signature,
  action,
  security,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const [loadingCopy, setLoadingCopy] = useState(false);
  const { notes, concilia, date } = values;
  const layout = { label: 2, input: 20 };

  const loadDefaultText = () => {
    setFieldValue(
      "notes",
      getInterventionTemplate(
        prescription,
        account,
        signature,
        concilia,
        security.hasCpoe()
      )
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
        <Box>
          <Col xs={layout.label}>
            <Heading as="label" size="14px">
              <Tooltip title="Informe o tipo desta conciliação">Tipo:</Tooltip>
            </Heading>
          </Col>
          <Col xs={layout.input}>
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
            {errors.concilia && touched.concilia && (
              <FieldError>{errors.concilia}</FieldError>
            )}
          </Col>
        </Box>
      )}
      {action === "schedule" && (
        <Box>
          <Col xs={24}>
            <Heading as="label" size="14px">
              Data da consulta:
            </Heading>
          </Col>
          <Col xs={24}>
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
            {errors.date && touched.date && (
              <FieldError>{errors.date}</FieldError>
            )}
          </Col>
        </Box>
      )}
      <Col xs={24} style={{ textAlign: "right" }}>
        {action !== "schedule" && (
          <>
            <Tooltip title="Aplicar evolução modelo">
              <Button
                shape="circle"
                icon={<DownloadOutlined />}
                onClick={loadDefaultText}
                type="primary gtm-bt-clinicalNotes-applyDefaultText"
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
              type="primary gtm-bt-clinicalNotes-configDefaultText"
              style={{ marginLeft: "5px" }}
            />
          </Tooltip>
        )}
      </Col>
      <Box>
        <Col xs={24}>
          <EditorBox>
            <Textarea
              autoFocus
              value={notes}
              onChange={({ target }) => setFieldValue("notes", target.value)}
              style={{ minHeight: "60vh" }}
              status={errors.notes && touched.notes ? "error" : null}
            />
            <MemoryDraft
              type={`draft_cn_${values.idPrescription}`}
              currentValue={values.notes}
              setValue={(value) => setFieldValue("notes", value)}
            ></MemoryDraft>
            {errors.notes && touched.notes && (
              <FieldError>{errors.notes}</FieldError>
            )}
          </EditorBox>
        </Col>
      </Box>
    </>
  );
}
