import React from "react";
import { Popover } from "antd";

import NumericValue from "components/NumericValue";

import { ConversionDetailsPopover } from "../../InterventionOutcome.style";

export default function PopoverFrequency({ outcomeData, source, children }) {
  return (
    <Popover
      content={
        <ConversionDetailsPopover>
          <div className="form-label">
            <label>Frequência prescrita:</label>
          </div>
          <div className="form-value">
            {outcomeData[source].item.idFrequency ? (
              <>
                {outcomeData[source].item.frequencyDescription ||
                  outcomeData[source].item.idFrequency}
              </>
            ) : (
              <span className="warning">Não informado</span>
            )}
          </div>

          <div className="form-label">
            <label>Frequência convertida:</label>
          </div>
          <div className="form-value">
            <NumericValue
              suffix={` vez(es) ao dia`}
              value={outcomeData[source].item.frequencyDay}
              decimalScale={2}
            />
          </div>
        </ConversionDetailsPopover>
      }
    >
      {children}
    </Popover>
  );
}
