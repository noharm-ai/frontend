import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { setBlock } from "../SummarySlice";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelPatient({ patient, position }) {
  const dispatch = useDispatch();

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
          <label>Data de Nascimento:</label> 01/01/2023
        </div>

        <div className="attribute">
          <label>Sexo:</label> Masculino
        </div>
      </div>

      <div className="attribute">
        <label>Cor:</label>
        <span>Não informado</span>
      </div>

      <div className="group">
        <div className="attribute">
          <label>Ocupação:</label> <span>Não informado</span>
        </div>

        <div className="attribute">
          <label>Estado Civil:</label> <span>Não informado</span>
        </div>
      </div>
    </SummaryPanel>
  );
}

export default SummaryPanelPatient;
