import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import NumericValue from "components/NumericValue";
import { setBlock } from "../SummarySlice";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelAttributes({ patient, position }) {
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
      <div className="group">
        <div className="attribute">
          <label>Peso:</label>{" "}
          <span>
            {patient.weight ? (
              <NumericValue value={patient.weight} suffix="Kg" />
            ) : (
              t("patientCard.notAvailable")
            )}
          </span>
        </div>

        <div className="attribute">
          <label>Altura:</label>
          <span>
            {patient.height ? (
              <NumericValue value={patient.height} suffix="cm" />
            ) : (
              t("patientCard.notAvailable")
            )}
          </span>
        </div>

        <div className="attribute">
          <label>IMC:</label>
          <span>
            {patient.imc ? (
              <NumericValue value={patient.imc} suffix="kg/m²" />
            ) : (
              t("patientCard.notAvailable")
            )}
          </span>
        </div>
      </div>
    </SummaryPanel>
  );
}

export default SummaryPanelAttributes;
