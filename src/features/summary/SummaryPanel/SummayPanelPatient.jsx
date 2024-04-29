import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { patientToText } from "../verbalizers";
import { setBlock } from "../SummarySlice";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelPatient({ patient, position }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(
      setBlock({
        id: position,
        data: patientToText(patient),
      })
    );
  }, [patient, dispatch, position]);

  return (
    <SummaryPanel>
      <div className="attribute">
        <label>{t("labels.name")}:</label> <span>{patient.name}</span>
      </div>

      <div className="group">
        <div className="attribute">
          <label>{t("tableHeader.birthdate")}:</label>
          <span>
            {patient.birthdate
              ? `${moment(patient.birthdate).format("DD/MM/YYYY")}`
              : "Não informado"}
          </span>
        </div>
        <div className="attribute">
          <label>{t("labels.admissionNumber")}:</label>
          <span>{patient.admissionNumber}</span>
        </div>
      </div>

      <div className="group">
        <div className="attribute">
          <label>{t("labels.gender")}:</label>
          <span>
            {patient.gender === "M"
              ? t("patientCard.male")
              : patient.gender === "F"
              ? t("patientCard.female")
              : "Não informado"}
          </span>
        </div>
        <div className="attribute">
          <label>{t("labels.skinColor")}:</label>
          <span>{patient.color || "Não informado"}</span>
        </div>
      </div>
    </SummaryPanel>
  );
}

export default SummaryPanelPatient;
