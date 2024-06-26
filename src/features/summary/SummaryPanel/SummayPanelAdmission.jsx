import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import moment from "moment";

import { admissionAttrToText } from "../verbalizers";
import { setBlock } from "../SummarySlice";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelAdmission({ patient, position }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(
      setBlock({
        id: position,
        data: admissionAttrToText(patient),
      })
    );
  }, [patient, dispatch, position]);

  return (
    <SummaryPanel>
      <div className="group">
        <div className="attribute">
          <label>{t("labels.admissionDate")}:</label>
          <span>
            {patient.admissionDate
              ? `${moment(patient.admissionDate).format("DD/MM/YYYY")}`
              : "Não informado"}
          </span>
        </div>

        <div className="attribute">
          <label>{t("labels.dischargeDate")}:</label>
          <span>
            {patient.dischargeDate
              ? `${moment(patient.dischargeDate).format("DD/MM/YYYY")}`
              : "Não informado"}
          </span>
        </div>
      </div>
    </SummaryPanel>
  );
}

export default SummaryPanelAdmission;
