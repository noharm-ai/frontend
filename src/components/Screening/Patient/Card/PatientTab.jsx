import React from "react";
import { useTranslation } from "react-i18next";
import { EditOutlined } from "@ant-design/icons";
import moment from "moment";

import Tooltip from "components/Tooltip";
import { PopoverWelcome } from "components/Popover";
import Button from "components/Button";
import Alert from "components/Alert";
import { getCorporalSurface, getIMC } from "utils/index";
import { translateDialysis } from "utils/transformers/prescriptions";

export default function PatientTab({
  prescription,
  setSeeMore,
  setModalVisibility,
}) {
  const { t } = useTranslation();
  const {
    age,
    birthdate,
    gender,
    weight,
    weightUser,
    weightDate,
    skinColor,
    dialysis,
    height,
    notesInfo,
    notesInfoDate,
    notesSigns,
    notesSignsDate,
    notesAllergiesDate,
    notesDialysisDate,
    features,
  } = prescription;

  const notesStats = [
    {
      key: "access",
      indicator: "acesso",
    },
    {
      key: "complication",
      indicator: "complication",
    },
    {
      key: "prevdrug",
      indicator: "medprevio",
    },
    {
      key: "pregnant",
      indicator: "gestante",
    },
    {
      key: "palliative",
      indicator: "paliativo",
    },
    {
      key: "resthid",
      indicator: "resthid",
    },
  ];

  const aiDataTooltip = (msg, date) => {
    if (date) {
      return `${msg} (${moment(date).format("DD/MM/YYYY HH:mm")})`;
    }

    return msg;
  };

  const AISuggestion = ({ notes, date, t }) => {
    return (
      <>
        <div style={{ maxWidth: "300px", textAlign: "center" }}>
          <Alert description={notes} type="info" />
        </div>
        <div style={{ fontSize: "11px", fontWeight: 300, marginTop: "10px" }}>
          {t("patientCard.extractedFrom")}{" "}
          {moment(date).format("DD/MM/YYYY HH:mm")}
        </div>
      </>
    );
  };

  const formatWeightDate = (weightDate) => {
    const emptyMsg = "data não disponível";
    if (!weightDate) {
      return emptyMsg;
    }

    const date = moment(weightDate);
    const now = moment();

    if (now.diff(date, "year") > 10) {
      return emptyMsg;
    }

    return date.format("DD/MM/YYYY HH:mm");
  };

  return (
    <div className="patient-data">
      <div className="patient-data-item edit">
        <div className="patient-data-item-label">{t("patientCard.age")}</div>
        <div className="patient-data-item-value">
          {age} {birthdate ? "" : t("patientCard.notAvailable")}
          <span className="small">
            {birthdate ? `(${moment(birthdate).format("DD/MM/YYYY")})` : ""}
          </span>
        </div>

        <div className="patient-data-item-edit">
          <Button
            type="link"
            onClick={() => setModalVisibility("patientEdit", true)}
            icon={<EditOutlined style={{ fontSize: 18, color: "#fff" }} />}
          ></Button>
        </div>
      </div>

      <div className="patient-data-item edit">
        <div className="patient-data-item-label">{t("patientCard.gender")}</div>
        <div className="patient-data-item-value">
          {gender
            ? gender === "M"
              ? t("patientCard.male")
              : t("patientCard.female")
            : ""}
        </div>

        <div className="patient-data-item-edit">
          <Button
            type="link"
            onClick={() => setModalVisibility("patientEdit", true)}
            icon={<EditOutlined style={{ fontSize: 18, color: "#fff" }} />}
          ></Button>
        </div>
      </div>

      <div className="patient-data-item edit">
        <div className="patient-data-item-label">{t("patientCard.height")}</div>
        <div className="patient-data-item-value">
          {height ? (
            <Tooltip title={weightUser ? t("patientCard.manuallyUpdated") : ""}>
              <span className={weightUser ? "hint" : ""}>{height} cm</span>
            </Tooltip>
          ) : (
            t("patientCard.notAvailable")
          )}
        </div>
        <div className="patient-data-item-edit">
          {notesInfo ? (
            <>
              <PopoverWelcome
                content={
                  <AISuggestion
                    notes={notesInfo}
                    date={notesInfoDate}
                    action={t("patientCard.editHeight")}
                    t={t}
                  />
                }
                placement="right"
                mouseLeaveDelay={0.02}
              >
                <Button
                  type="link"
                  onClick={() => setModalVisibility("patientEdit", true)}
                  icon={
                    <EditOutlined style={{ fontSize: 18, color: "#fff" }} />
                  }
                ></Button>
              </PopoverWelcome>
            </>
          ) : (
            <Button
              type="link"
              icon={<EditOutlined style={{ fontSize: 18, color: "#fff" }} />}
              onClick={() => setModalVisibility("patientEdit", true)}
            ></Button>
          )}
        </div>
      </div>

      <div className="patient-data-item edit">
        <div className="patient-data-item-label">{t("patientCard.weight")}</div>
        <div className="patient-data-item-value">
          {weight && (
            <>
              <Tooltip
                title={weightUser ? t("patientCard.manuallyUpdated") : ""}
              >
                <span className={weightUser ? "hint" : ""}>{weight} Kg</span>
              </Tooltip>{" "}
              <span className="small">({formatWeightDate(weightDate)})</span>
            </>
          )}
          {!weight && t("patientCard.notAvailable")}
        </div>
        <div className="patient-data-item-edit">
          {notesInfo ? (
            <>
              <PopoverWelcome
                content={
                  <AISuggestion
                    notes={notesInfo}
                    date={notesInfoDate}
                    action={t("patientCard.editWeigth")}
                    t={t}
                  />
                }
                placement="right"
                mouseLeaveDelay={0.02}
              >
                <Button
                  type="link"
                  onClick={() => setModalVisibility("patientEdit", true)}
                  icon={
                    <EditOutlined style={{ fontSize: 18, color: "#fff" }} />
                  }
                ></Button>
              </PopoverWelcome>
            </>
          ) : (
            <Button
              type="link"
              onClick={() => setModalVisibility("patientEdit", true)}
              icon={<EditOutlined style={{ fontSize: 18, color: "#fff" }} />}
            ></Button>
          )}
        </div>
      </div>

      <div className="patient-data-item">
        <div className="patient-data-item-label">{t("patientCard.bmi")}</div>
        <div className="patient-data-item-value">
          {weight && height ? (
            <>{getIMC(weight, height).toFixed(2)} kg/m²</>
          ) : (
            t("patientCard.notAvailable")
          )}
        </div>
      </div>

      <div className="patient-data-item">
        <div className="patient-data-item-label">
          {t("patientCard.bodySurface")}
        </div>
        <div className="patient-data-item-value">
          {weight && height ? (
            <>{getCorporalSurface(weight, height).toFixed(3)} m²</>
          ) : (
            t("patientCard.notAvailable")
          )}
        </div>
      </div>

      <div className={"patient-data-item edit"}>
        <div className="patient-data-item-label">{t("patientCard.skin")}</div>
        <div className="patient-data-item-value">{skinColor}</div>

        <div className="patient-data-item-edit">
          <Button
            type="link"
            onClick={() => setModalVisibility("patientEdit", true)}
            icon={<EditOutlined style={{ fontSize: 18, color: "#fff" }} />}
          ></Button>
        </div>
      </div>

      <div className="patient-data-item edit">
        <div className="patient-data-item-label">{t("labels.dialysis")}</div>
        <div className="patient-data-item-value">
          {translateDialysis(dialysis)}
        </div>
        <div className="patient-data-item-edit">
          <Button
            type="link"
            onClick={() => setModalVisibility("patientEdit", true)}
            icon={<EditOutlined style={{ fontSize: 18, color: "#fff" }} />}
          ></Button>
        </div>
      </div>

      <div className="patient-data-item full">
        <div
          className="patient-data-item-value"
          style={{
            display: "flex",
            rowGap: "5px",
            overflow: "auto",
            flexWrap: "wrap",
          }}
        >
          {notesInfo && (
            <Tooltip
              title={aiDataTooltip(
                t("patientCard.dataExtractedFrom"),
                notesInfoDate
              )}
            >
              <div className="tag info" onClick={() => setSeeMore(true)}>
                {t("patientCard.data")}
              </div>
            </Tooltip>
          )}

          {notesSigns && (
            <Tooltip
              title={aiDataTooltip(
                t("patientCard.signalsExtractedFrom"),
                notesSignsDate
              )}
            >
              <div className="tag signs" onClick={() => setSeeMore(true)}>
                {t("patientCard.signals")}
              </div>
            </Tooltip>
          )}

          {notesAllergiesDate && (
            <Tooltip
              title={aiDataTooltip(
                t("patientCard.allergiesExtractedFrom"),
                notesAllergiesDate
              )}
            >
              <div className="tag allergy" onClick={() => setSeeMore(true)}>
                {t("clinicalNotesIndicator.allergy")}
              </div>
            </Tooltip>
          )}

          {notesDialysisDate && (
            <Tooltip
              title={aiDataTooltip(
                t("patientCard.extractedFrom"),
                notesDialysisDate
              )}
            >
              <div className="tag dialysis" onClick={() => setSeeMore(true)}>
                {t("clinicalNotesIndicator.dialysis")}
              </div>
            </Tooltip>
          )}

          {notesStats.map(({ key, indicator }) => (
            <React.Fragment key={key}>
              {features?.clinicalNotesStats[key] > 0 && (
                <Tooltip title="Abrir evoluções com esta anotação">
                  <div
                    className={`tag ${indicator}`}
                    onClick={() =>
                      setModalVisibility("clinicalNotes", {
                        indicators: [indicator],
                      })
                    }
                  >
                    {t(`clinicalNotesIndicator.${indicator}`)}
                  </div>
                </Tooltip>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
