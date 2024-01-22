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
import { Affix } from "antd";
import { useTransition, animated, config } from "@react-spring/web";

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

import { ScreeningHeader } from "components/Screening/index.style";

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
  const [affixed, setAffixed] = useState(false);
  const { t } = useTranslation();
  const transitions = useTransition(affixed, {
    from: {
      opacity: 0,
      transform: "translate3d(5px, 0, 0)",
    },
    enter: { opacity: 1, transform: "translate3d(0, 0, 0)" },
    delay: 150,
    config: config.slow,
  });

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

  const TitleLegend = ({ content, type }) => {
    if (type === "conciliation") {
      return null;
    }

    if (content.agg) {
      return (
        <span className="legend">
          {t("screeningHeader.subtitleAdmission")} {content.dateOnlyFormated}
        </span>
      );
    }

    return (
      <span
        className={expireDate.diff(now, "minute") < 0 ? "legend red" : "legend"}
      >
        {t("screeningHeader.issuedOn")} {content.dateFormated}
        {content.expire && (
          <>
            , {t("screeningHeader.validUntil")} {content.expireFormated}
          </>
        )}
        {content.expire && expireDate.diff(createDate, "hour") < 23 && (
          <Tooltip title={t("screeningHeader.intercurrence")}>
            {" "}
            <InfoIcon />
          </Tooltip>
        )}
      </span>
    );
  };

  const Title = ({ content, type, small }) => {
    const label =
      type === "conciliation"
        ? t("screeningHeader.titleConciliation")
        : content.agg
        ? t("screeningHeader.titleAdmission")
        : t("screeningHeader.titlePrescription");
    const id =
      type === "conciliation" || !content.agg
        ? content.idPrescription
        : content.admissionNumber;

    if (small) {
      return (
        <Heading style={{ fontSize: "18px", paddingTop: "2px" }}>
          {label}{" "}
          <Tooltip title={t("screeningHeader.copyHint")}>
            <UnstyledButton onClick={() => copyToClipboard(id)}>
              {id}
            </UnstyledButton>
          </Tooltip>
          {content.agg ? (
            <span
              style={{ fontWeight: 400 }}
            >{` - ${content.dateOnlyFormated}`}</span>
          ) : (
            ""
          )}
          <span className="legend">{content.namePatient}</span>
        </Heading>
      );
    }

    return (
      <Heading>
        {label}{" "}
        <Tooltip title={t("screeningHeader.copyHint")}>
          <UnstyledButton onClick={() => copyToClipboard(id)}>
            {id}
          </UnstyledButton>
        </Tooltip>
        <TitleLegend content={content} type={type} />
      </Heading>
    );
  };

  if (!prescription.content.idPrescription) {
    return null;
  }

  return (
    <Affix onChange={(value) => setAffixed(value)}>
      <ScreeningHeader className={`${affixed ? "affixed" : ""}`}>
        <Row type="flex">
          <Col span={24} md={10}>
            {transitions((styles) => (
              <animated.div style={styles}>
                <Title
                  content={prescription.content}
                  type={type}
                  small={affixed}
                />
              </animated.div>
            ))}
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
      </ScreeningHeader>
    </Affix>
  );
}
