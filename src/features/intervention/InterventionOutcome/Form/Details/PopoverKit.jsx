import React from "react";
import { Popover, Space } from "antd";

import NumericValue from "components/NumericValue";

import { ConversionDetailsPopover } from "../../InterventionOutcome.style";

export default function PopoverKit({ outcomeData, source, children }) {
  return (
    <Popover
      title="Custo dos componentes"
      content={
        <ConversionDetailsPopover>
          <Space>
            {outcomeData[source].item.kit?.list?.length > 0 ? (
              <>
                {outcomeData[source].item.kit.list.map((c, i) => (
                  <div className="component" key={c.name + i}>
                    <div>{c.name}</div>
                    <div>
                      <NumericValue
                        prefix="R$ "
                        suffix={` / ${c.idMeasureUnit}`}
                        value={c.price}
                        decimalScale={6}
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="component">Nenhum componente encontrado</div>
            )}
          </Space>
        </ConversionDetailsPopover>
      }
    >
      {children}
    </Popover>
  );
}
