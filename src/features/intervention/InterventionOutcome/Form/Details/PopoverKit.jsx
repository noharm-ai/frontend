import React from "react";
import { Popover, Space } from "antd";

import NumericValue from "components/NumericValue";

import { KitDetailsPopover } from "../../InterventionOutcome.style";

export default function PopoverKit({ outcomeData, source, children }) {
  return (
    <Popover
      title="Custo dos componentes"
      content={
        <KitDetailsPopover>
          <Space direction="vertical">
            {outcomeData[source].item.kit?.list?.length > 0 ? (
              <>
                {outcomeData[source].item.kit.list.map((c, i) => (
                  <div className="component" key={c.name + i}>
                    <div>{c.name}</div>
                    <div>
                      <NumericValue
                        prefix="R$ "
                        suffix={` / ${c.idMeasureUnit || "-"}`}
                        value={c.price}
                        decimalScale={2}
                        fixedDecimalScale={2}
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="component">Nenhum componente encontrado</div>
            )}
          </Space>
        </KitDetailsPopover>
      }
    >
      {children}
    </Popover>
  );
}
