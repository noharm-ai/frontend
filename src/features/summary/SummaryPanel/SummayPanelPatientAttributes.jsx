import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";

import NumericValue from "components/NumericValue";
import { patientAttrToText } from "../verbalizers";
import { setBlock } from "../SummarySlice";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelAttributes({ patient, position }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(
      setBlock({
        id: position,
        data: patientAttrToText(patient),
      })
    );
  }, [patient, dispatch, position]);

  return (
    <SummaryPanel>
      <div className="group">
        <div className="attribute">
          <label>{t("patientCard.weight")}:</label>{" "}
          <span>
            <>
              {patient.weight ? (
                <NumericValue value={patient.weight} suffix="Kg" />
              ) : (
                t("patientCard.notAvailable")
              )}
              {patient.weightDate ? (
                <span>
                  {" "}
                  ({moment(patient.weightDate).format("DD/MM/YYYY")})
                </span>
              ) : null}
            </>
          </span>
        </div>

        <div className="attribute">
          <label>{t("patientCard.height")}:</label>
          <span>
            {patient.height ? (
              <NumericValue value={patient.height} suffix="cm" />
            ) : (
              t("patientCard.notAvailable")
            )}
          </span>
        </div>

        <div className="attribute">
          <label>{t("patientCard.bmi")}:</label>
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
