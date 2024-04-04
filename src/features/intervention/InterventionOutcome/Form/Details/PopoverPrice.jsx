import React from "react";
import { Space, Popover } from "antd";

import Tooltip from "components/Tooltip";
import NumericValue from "components/NumericValue";
import EditConversion from "../EditConversion";

import { ConversionDetailsPopover } from "../../InterventionOutcome.style";

export default function PopoverPrice({ outcomeData, source, children }) {
  return (
    <Popover
      content={
        <ConversionDetailsPopover>
          <div className="form-label">
            <label>Custo registrado:</label>
          </div>
          <div className="form-value">
            {outcomeData[source].item?.beforeConversion?.price &&
            outcomeData[source].item.beforeConversion.idMeasureUnitPrice ? (
              <NumericValue
                prefix="R$ "
                suffix={` / ${outcomeData[source].item.beforeConversion.idMeasureUnitPrice}`}
                value={outcomeData[source].item.beforeConversion.price}
                decimalScale={2}
              />
            ) : (
              <span className="warning">
                <Tooltip
                  underline
                  title="Acione a Ajuda para que a integração do valor de custo seja efetuada. Se desejar, você pode informar o custo manualmente."
                >
                  Indisponível
                </Tooltip>
              </span>
            )}
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
                  outcomeData[source].item.beforeConversion.idMeasureUnitPrice
                }
                idMeasureUnitConverted={outcomeData[source].item.idMeasureUnit}
                factor={outcomeData[source].item.conversion.priceFactor}
                readonly={outcomeData.header?.readonly}
              />
            </Space>
          </div>

          <div className="form-label">
            <label>Custo convertido:</label>
          </div>
          <div className="form-value">
            {outcomeData[source].item.price ? (
              <NumericValue
                prefix="R$ "
                suffix={` / ${
                  outcomeData[source].item.idMeasureUnit ||
                  "(Unidade Padrão não informada)"
                }`}
                value={outcomeData[source].item.price}
                decimalScale={6}
              />
            ) : (
              <span className="warning">Não informado</span>
            )}
          </div>
        </ConversionDetailsPopover>
      }
    >
      {children}
    </Popover>
  );
}
