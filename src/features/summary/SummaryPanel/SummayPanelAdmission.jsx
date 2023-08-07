import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";

import { setBlock } from "../SummarySlice";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelAdmission({ patient, position }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setBlock({
        id: position,
        data: `Data de internacao: ....`,
      })
    );
  }, [patient, dispatch, position]);

  return (
    <SummaryPanel>
      <div className="group">
        <div className="attribute">
          <label>Data da Internação:</label>
          <span>
            {patient.admissionDate
              ? `${moment(patient.admissionDate).format("DD/MM/YYYY")}`
              : "Não informado"}
          </span>
        </div>

        <div className="attribute">
          <label>Data da Alta:</label>
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
