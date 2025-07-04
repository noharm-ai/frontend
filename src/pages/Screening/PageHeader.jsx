import styled from "styled-components";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  CheckOutlined,
  AlertOutlined,
  FileAddOutlined,
  RollbackOutlined,
  ScheduleOutlined,
  SafetyCertificateOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import { Affix, Popover } from "antd";
import dayjs from "dayjs";

import { InfoIcon } from "components/Icon";
import Heading, { AffixedHeader } from "components/Heading";
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
import pageTimer from "utils/pageTimer";
import FeatureService from "services/features";
import { setCheckSummary } from "features/prescription/PrescriptionSlice";
import {
  trackPrescriptionAction,
  TrackedPrescriptionAction,
} from "src/utils/tracker";

import { ScreeningHeader } from "components/Screening/index.style";

const close = () => {
  trackPrescriptionAction(TrackedPrescriptionAction.CLICK_CLOSE);
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
  reviewPatient,
  incrementClinicalNotes,
  userId,
  features,
}) {
  const dispatch = useDispatch();
  const params = useParams();
  const id = params?.slug;
  const { isChecking } = prescription.check;
  const [isReviewing, setReviewing] = useState(false);
  const [isClinicalNotesVisible, setClinicalNotesVisibility] = useState(false);
  const [isClinicalNotesFormsVisible, setClinicalNotesFormsVisibility] =
    useState(false);
  const [isClinicalAlertVisible, setClinicalAlertVisibility] = useState(false);
  const [clinicalNotesAction, setClinicalNotesAction] =
    useState("clinicalNote");
  const [affixed, setAffixed] = useState(false);
  const { t } = useTranslation();
  const featureService = FeatureService(features);

  useEffect(() => {
    if (!window.noharm) {
      window.noharm = {};
    }
    if (!window.noharm.pageTimer) {
      window.noharm.pageTimer = pageTimer({ debug: false });
    }

    window.noharm.pageTimer.start();

    return () => {
      if (window.noharm?.pageTimer) {
        window.noharm.pageTimer.stop();
      }
    };
  }, []);

  const hasPrimaryCare = featureService.hasPrimaryCare();
  const hasUncheckPermission = featureService.hasLockCheckedPrescription()
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
    trackPrescriptionAction(
      TrackedPrescriptionAction.CLICK_CLINICAL_NOTES_FORM
    );

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

  const confirmCheckPrescription = (id) => {
    trackPrescriptionAction(TrackedPrescriptionAction.CLICK_CHECK);

    let highRiskAlerts = [];
    if (
      prescription?.content?.alertsList &&
      prescription.content.alertsList.length
    ) {
      highRiskAlerts = prescription.content.alertsList.filter(
        (a) => a.level === "high"
      );
    }

    if (highRiskAlerts.length > 0) {
      dispatch(setCheckSummary(prescription.content));
    } else {
      setPrescriptionStatus(id, "s");
    }
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

  const setReviewType = (id, reviewType) => {
    trackPrescriptionAction(TrackedPrescriptionAction.CLICK_REVIEW);
    setReviewing(true);

    reviewPatient(id, reviewType)
      .then(() => {
        setReviewing(false);
        notification.success({
          message:
            reviewType === 1
              ? "Revisão efetuada com sucesso!"
              : "Revisão desfeita com sucesso!",
        });
      })
      .catch((err) => {
        setReviewing(false);
        console.error("error", err);
        notification.error({
          message: t("error.title"),
          description: getErrorMessageFromException(err, t),
        });
      });
  };

  const openAlertModal = () => {
    setClinicalAlertVisibility(true);
    trackPrescriptionAction(TrackedPrescriptionAction.CLICK_ALERT_FORM);
  };

  const now = moment();
  const createDate = moment(prescription.content.date);
  const expireDate = moment(prescription.content.expire);

  const TitleLegend = ({ content, type }) => {
    if (type === "conciliation") {
      return <span className="legend">{content.dateOnlyFormated}</span>;
    }

    if (content.agg || type === "conciliation") {
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
        <AffixedHeader style={{ paddingTop: "2px" }}>
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
        </AffixedHeader>
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
            <Title content={prescription.content} type={type} small={affixed} />
          </Col>
          <Col
            span={24}
            md={24 - 10}
            css="
          display:flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
        "
          >
            {prescription.content.status === "0" && (
              <Button
                type="primary"
                className="gtm-bt-check"
                icon={<CheckOutlined />}
                ghost
                onClick={() => confirmCheckPrescription(id)}
                loading={isChecking}
                style={{ marginRight: "5px" }}
              >
                {t("screeningHeader.btnCheck")}
              </Button>
            )}
            {prescription.content.status === "s" && (
              <>
                <span
                  style={{
                    marginRight: "10px",
                    lineHeight: 1.4,
                    color: "var(--nh-text-color)",
                  }}
                >
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
            {featureService.hasPatientRevision() &&
              prescription.content.agg && (
                <Popover
                  content={
                    prescription.content.review?.reviewed ? (
                      <div>
                        <p style={{ marginTop: "0" }}>
                          <strong>Revisado por:</strong>
                        </p>
                        <p>
                          {prescription.content.review?.reviewedBy}
                          <br />
                          <span style={{ fontSize: "12px", fontWeight: 300 }}>
                            {dayjs(
                              prescription.content.review?.reviewedAt
                            ).format("DD/MM/YYYY HH:mm")}
                          </span>
                        </p>
                        <Button
                          danger
                          onClick={() => setReviewType(id, 0)}
                          icon={<RollbackOutlined />}
                          loading={isReviewing}
                          block
                          style={{ marginTop: "5px" }}
                        >
                          Desfazer Revisão
                        </Button>
                      </div>
                    ) : null
                  }
                >
                  <Button
                    type="primary"
                    className="gtm-bt-review"
                    icon={
                      prescription.content.review?.reviewed ? (
                        <SafetyCertificateFilled />
                      ) : (
                        <SafetyCertificateOutlined />
                      )
                    }
                    style={{ marginRight: "5px" }}
                    loading={isReviewing}
                    ghost={!prescription.content.review?.reviewed}
                    onClick={() =>
                      !prescription.content.review?.reviewed &&
                      setReviewType(id, 1)
                    }
                  >
                    {prescription.content.review?.reviewed
                      ? t("screeningHeader.btnReviewed")
                      : t("screeningHeader.btnReview")}
                  </Button>
                </Popover>
              )}
            {hasPrimaryCare && (
              <Button
                type="primary"
                className="gtm-bt-clinical-notes-schedule"
                onClick={() => openScheduleModal()}
                style={{ marginRight: "5px" }}
                ghost={!prescription.content.notes}
              >
                <ScheduleOutlined />
                {t("screeningHeader.btnSchedule")}
              </Button>
            )}
            <Button
              type="primary"
              className="gtm-bt-clinical-notes"
              onClick={() => openClinicalNotesModal()}
              style={{ marginRight: "5px" }}
              ghost={!prescription.content.notes}
            >
              <FileAddOutlined />
              {t("screeningHeader.btnClinicalNotes")}
            </Button>
            {type !== "conciliation" &&
              featureService.hasPrescriptionAlert() && (
                <Button
                  type="primary"
                  className="gtm-bt-alert"
                  onClick={() => openAlertModal()}
                  style={{ marginRight: "5px" }}
                  ghost={!prescription.content.alert}
                >
                  <AlertOutlined />
                  {t("screeningHeader.btnAlert")}
                </Button>
              )}

            <Button type="default" className="gtm-bt-close" onClick={close}>
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
