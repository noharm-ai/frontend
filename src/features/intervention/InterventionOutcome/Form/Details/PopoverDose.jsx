import React from "react";
import { Space, Popover } from "antd";

import NumericValue from "components/NumericValue";
import EditConversion from "../EditConversion";

import { ConversionDetailsPopover } from "../../InterventionOutcome.style";

export default function PopoverDose({ outcomeData, source, children }) {
  return (
    <Popover
      content={
        <ConversionDetailsPopover>
          <div className="form-label">
            <label>Dose prescrita:</label>
          </div>
          <div className="form-value">
            <NumericValue
              suffix={` ${outcomeData[source].item.beforeConversion.idMeasureUnit}`}
              value={outcomeData[source].item.beforeConversion.dose}
              decimalScale={4}
            />
          </div>

          <div className="form-label">
            <label>Fator de conversão:</label>
          </div>
          <div className="form-value">
            <Space direction="horizontal">
              <EditConversion
                idSegment={outcomeData.header?.idSegment}
                idDrug={outcomeData[source].item.idDrug}
                idMeasureUnit={
                  outcomeData[source].item.beforeConversion.idMeasureUnit
                }
                idMeasureUnitConverted={outcomeData[source].item.idMeasureUnit}
                factor={outcomeData[source].item.conversion.doseFactor}
                readonly={outcomeData.header?.readonly}
              />
            </Space>
          </div>

          <div className="form-label">
            <label>Dose convertida:</label>
          </div>
          <div className="form-value">
            <NumericValue
              suffix={` ${outcomeData[source].item.idMeasureUnit}`}
              value={outcomeData[source].item.dose}
              decimalScale={4}
            />
          </div>
        </ConversionDetailsPopover>
      }
    >
      {children}
    </Popover>
  );
}
