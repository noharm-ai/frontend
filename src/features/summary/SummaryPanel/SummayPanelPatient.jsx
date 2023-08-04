import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { setBlock } from "../SummarySlice";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelPatient({ patient, position }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(
      setBlock({
        id: position,
        data: `Nome do paciente: ....`,
      })
    );
  }, [patient, dispatch, position]);

  return (
    <SummaryPanel>
      <div className="attribute">
        <label>Nome do Paciente:</label> <span>Paciente1</span>
      </div>

      <div className="group">
        <div className="attribute">
          <label>Data de Nascimento:</label>
          <span>
            {patient.birthdate
              ? `${moment(patient.birthdate).format("DD/MM/YYYY")}`
              : "Não informado"}
          </span>
        </div>

        <div className="attribute">
          <label>Sexo:</label>
          <span>
            {patient.gender === "M"
              ? t("patientCard.male")
              : patient.gender === "F"
              ? t("patientCard.female")
              : "Não informado"}
          </span>
        </div>
      </div>

      <div className="attribute">
        <label>Cor:</label>
        <span>{patient.color || "Não informado"}</span>
      </div>
    </SummaryPanel>
  );
}

export default SummaryPanelPatient;
