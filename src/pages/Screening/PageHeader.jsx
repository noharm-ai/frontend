import styled from "styled-components/macro";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  CheckOutlined,
  AlertOutlined,
  FileAddOutlined,
  RollbackOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";

import { InfoIcon } from "components/Icon";
import Heading from "components/Heading";
import Button from "components/Button";
import { Row, Col } from "components/Grid";
import notification from "components/notification";
import Tooltip from "components/Tooltip";
import moment from "moment";

import ClinicalNotes from "containers/Forms/ClinicalNotes";
import ClinicalNotesSchedule from "containers/Forms/ClinicalNotes/ScheduleForm";
import ClinicalNotesCustomForm from "containers/Forms/ClinicalNotes/CustomForm";
import FormClinicalAlert from "containers/Forms/ClinicalAlert";
import { getErrorMessageFromException } from "utils/errorHandler";

const close = () => {
  window.close();
};

const UnstyledButton = styled.button`
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  line-height: 1;

  &:hover {
    text-decoration: underline;
  }
`;

export default function PageHeader({
  prescription,
  type,
  checkScreening,
  incrementClinicalNotes,
  security,
  featureService,
  userId,
}) {
  const params = useParams();
  const id = params?.slug;
  const { isChecking } = prescription.check;
  const [isClinicalNotesVisible, setClinicalNotesVisibility] = useState(false);
  const [isClinicalNotesFormsVisible, setClinicalNotesFormsVisibility] =
    useState(false);
  const [isClinicalAlertVisible, setClinicalAlertVisibility] = useState(false);
  const [clinicalNotesAction, setClinicalNotesAction] =
    useState("clinicalNote");
  const { t } = useTranslation();

  const hasPrimaryCare = featureService.hasPrimaryCare();
  const hasUncheckPermission =
    featureService.hasLockCheckedPrescription() &&
    !security.hasUnlockCheckedPrescription()
      ? `${userId}` === `${prescription?.content.userId}`
      : true;

  const onCancelClinicalNotes = () => {
    setClinicalNotesVisibility(false);
  };

  const onCancelClinicalNotesForms = () => {
    setClinicalNotesFormsVisibility(false);
  };

  const afterSaveClinicalNotes = () => {
    setClinicalNotesVisibility(false);
  };

  const afterSaveClinicalNotesSchedule = () => {
    setClinicalNotesVisibility(false);
    incrementClinicalNotes();
  };

  const afterSaveClinicalNotesPrimaryCare = () => {
    setClinicalNotesFormsVisibility(false);
    incrementClinicalNotes();
  };

  const onCancelClinicalAlert = () => {
    setClinicalAlertVisibility(false);
  };

  const afterSaveClinicalAlert = () => {
    setClinicalAlertVisibility(false);
  };

  const openScheduleModal = () => {
    setClinicalNotesAction("schedule");
    setClinicalNotesVisibility(true);
  };

  const openClinicalNotesModal = () => {
    if (hasPrimaryCare) {
      setClinicalNotesFormsVisibility(true);
    } else {
      setClinicalNotesAction("clinicalNote");
      setClinicalNotesVisibility(true);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    notification.success({ message: "Número da prescrição copiado!" });
  };

  const setPrescriptionStatus = (id, status) => {
    checkScreening(id, status)
      .then(() => {
        notification.success({
          message:
            status === "s"
              ? "Checagem efetuada com sucesso!"
              : "Checagem desfeita com sucesso!",
        });
      })
      .catch((err) => {
        console.error("error", err);
        notification.error({
          message: t("error.title"),
          description: getErrorMessageFromException(err, t),
        });
      });
  };

  const now = moment();
  const createDate = moment(prescription.content.date);
  const expireDate = moment(prescription.content.expire);

  const Title = ({ content, type }) => {
    if (type === "conciliation") {
      return (
        <Heading>
          {t("screeningHeader.titleConciliation")}{" "}
          <Tooltip title={t("screeningHeader.copyHint")}>
            <UnstyledButton
              onClick={() => copyToClipboard(content.idPrescription)}
            >
              {content.idPrescription}
            </UnstyledButton>
          </Tooltip>
        </Heading>
      );
    }

    if (!content.agg) {
      return (
        <Heading>
          {t("screeningHeader.titlePrescription")}{" "}
          <Tooltip title={t("screeningHeader.copyHint")}>
            <UnstyledButton
              onClick={() =>
                copyToClipboard(prescription.content.idPrescription)
              }
            >
              {prescription.content.idPrescription}
            </UnstyledButton>
          </Tooltip>
          <span
            className={
              expireDate.diff(now, "minute") < 0 ? "legend red" : "legend"
            }
          >
            {t("screeningHeader.issuedOn")} {prescription.content.dateFormated}
            {prescription.content.expire && (
              <>
                , {t("screeningHeader.validUntil")}{" "}
                {prescription.content.expireFormated}
              </>
            )}
            {prescription.content.expire &&
              expireDate.diff(createDate, "hour") < 23 && (
                <Tooltip title={t("screeningHeader.intercurrence")}>
                  {" "}
                  <InfoIcon />
                </Tooltip>
              )}
          </span>
        </Heading>
      );
    }
    // aggregated

    return (
      <Heading css="line-height: 1.2;">
        {t("screeningHeader.titleAdmission")}{" "}
        <Tooltip title={t("screeningHeader.copyHint")}>
          <UnstyledButton
            onClick={() =>
              copyToClipboard(prescription.content.admissionNumber)
            }
          >
            {prescription.content.admissionNumber}
          </UnstyledButton>
        </Tooltip>
        <span className="legend">
          {t("screeningHeader.subtitleAdmission")}{" "}
          {prescription.content.dateOnlyFormated}
        </span>
      </Heading>
    );
  };

  if (!prescription.content.idPrescription) {
    return null;
  }

  return (
    <>
      <Row type="flex" css="margin-bottom: 15px;">
        <Col span={24} md={10}>
          <Title content={prescription.content} type={type} />
        </Col>
        <Col
          span={24}
          md={24 - 10}
          css="
          display:flex;
          align-items: center;
          justify-content: flex-end;
        "
        >
          {prescription.content.status === "0" && (
            <Button
              type="primary gtm-bt-check"
              icon={<CheckOutlined />}
              ghost
              onClick={() => setPrescriptionStatus(id, "s")}
              loading={isChecking}
              style={{ marginRight: "5px" }}
            >
              {t("screeningHeader.btnCheck")}
            </Button>
          )}
          {prescription.content.status === "s" && (
            <>
              <span style={{ marginRight: "10px", lineHeight: 1.4 }}>
                {prescription.content.user ? (
                  <>
                    {t("labels.checkedBy")}
                    <br />
                    {prescription.content.user}
                  </>
                ) : (
                  <>
                    {t("screeningHeader.btnChecked")} <CheckOutlined />
                  </>
                )}
              </span>
              <Tooltip
                title={
                  hasUncheckPermission
                    ? t("screeningHeader.btnUndoCheck")
                    : t("screeningHeader.btnUndoCheckDisabled")
                }
              >
                <Button
                  className="gtm-bt-undo-check"
                  danger
                  onClick={() => setPrescriptionStatus(id, "0")}
                  icon={<RollbackOutlined style={{ fontSize: 16 }} />}
                  loading={isChecking}
                  style={{ marginRight: "5px" }}
                  disabled={!hasUncheckPermission}
                ></Button>
              </Tooltip>
            </>
          )}
          {hasPrimaryCare && (
            <Button
              type="primary gtm-bt-clinical-notes-schedule"
              onClick={() => openScheduleModal()}
              style={{ marginRight: "5px" }}
              ghost={!prescription.content.notes}
            >
              <ScheduleOutlined />
              {t("screeningHeader.btnSchedule")}
            </Button>
          )}
          <Button
            type="primary gtm-bt-clinical-notes"
            onClick={() => openClinicalNotesModal()}
            style={{ marginRight: "5px" }}
            ghost={!prescription.content.notes}
          >
            <FileAddOutlined />
            {t("screeningHeader.btnClinicalNotes")}
          </Button>
          {type !== "conciliation" && security.hasAlertIntegration() && (
            <Button
              type="primary gtm-bt-alert"
              onClick={() => setClinicalAlertVisibility(true)}
              style={{ marginRight: "5px" }}
              ghost={!prescription.content.alert}
            >
              <AlertOutlined />
              {t("screeningHeader.btnAlert")}
            </Button>
          )}

          <Button type="default gtm-bt-close" onClick={close}>
            {t("screeningHeader.btnClose")}
          </Button>
        </Col>
      </Row>
      {hasPrimaryCare ? (
        <>
          {isClinicalNotesFormsVisible && (
            <ClinicalNotesCustomForm
              open={isClinicalNotesFormsVisible}
              onCancel={onCancelClinicalNotesForms}
              okText="Salvar"
              okType="primary"
              cancelText="Cancelar"
              afterSave={afterSaveClinicalNotesPrimaryCare}
            />
          )}
          {isClinicalNotesVisible && (
            <ClinicalNotesSchedule
              open={isClinicalNotesVisible}
              action={clinicalNotesAction}
              onCancel={onCancelClinicalNotes}
              okText="Salvar"
              okType="primary"
              cancelText="Cancelar"
              afterSave={afterSaveClinicalNotesSchedule}
            />
          )}
        </>
      ) : (
        <ClinicalNotes
          open={isClinicalNotesVisible}
          action={clinicalNotesAction}
          onCancel={onCancelClinicalNotes}
          okText="Salvar"
          okType="primary"
          cancelText="Cancelar"
          afterSave={afterSaveClinicalNotes}
        />
      )}

      <FormClinicalAlert
        open={isClinicalAlertVisible}
        onCancel={onCancelClinicalAlert}
        okText="Salvar"
        okType="primary"
        cancelText="Cancelar"
        afterSave={afterSaveClinicalAlert}
      />
    </>
  );
}
