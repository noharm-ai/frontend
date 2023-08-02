import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

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
          <label>Data da Internação:</label> 01/01/2023
        </div>

        <div className="attribute">
          <label>Data da Alta:</label> 01/01/2023
        </div>
      </div>
    </SummaryPanel>
  );
}

export default SummaryPanelAdmission;
