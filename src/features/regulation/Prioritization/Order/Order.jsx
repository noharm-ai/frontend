import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CaretUpOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { Select } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { addOrder, updateOrder, deleteOrder } from "../PrioritizationSlice";

import { OrderContainer } from "./Order.style";

export const ORDER_OPTIONS = [
  {
    label: "Data de solicitação",
    key: "date",
    type: "number",
  },
  {
    label: "Risco",
    key: "risk",
    type: "number",
  },
];

export default function Order() {
  const dispatch = useDispatch();
  const orderList = useSelector(
    (state) => state.regulation.prioritization.order
  );

  const onChangePrioritization = (value, position, attr) => {
    dispatch(updateOrder({ position: position, order: { [attr]: value } }));
  };

  return (
    <OrderContainer>
      {orderList.map((i, position) => (
        <div className="order-item" key={position}>
          {position === 0 ? (
            <div className="order-item-label">Priorizar por:</div>
          ) : (
            <div className="order-item-label">&nbsp;</div>
          )}

          <div className="order-item-value flex">
            <Select
              className="prioritization-select"
              optionFilterProp="children"
              onChange={(value) =>
                onChangePrioritization(value, position, "field")
              }
              value={i.field}
              style={{ width: 200 }}
            >
              {ORDER_OPTIONS.map((o) => (
                <Select.Option value={o.key} key={o.key}>
                  {o.label}
                </Select.Option>
              ))}
            </Select>
            <div>
              <Tooltip title="Alterar ordem">
                <Button
                  className={`${
                    i.direction === "desc" ? "order-desc" : "order-asc"
                  }`}
                  shape="circle"
                  icon={<CaretUpOutlined />}
                  onClick={() =>
                    onChangePrioritization(
                      i.direction === "desc" ? "asc" : "desc",
                      position,
                      "direction"
                    )
                  }
                  style={{ marginLeft: "5px" }}
                />
              </Tooltip>
              {position > 0 && (
                <Tooltip title="Remover">
                  <Button
                    shape="circle"
                    icon={<DeleteOutlined />}
                    size="small"
                    style={{ width: "24px" }}
                    onClick={() => dispatch(deleteOrder({ position }))}
                  />
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      ))}
      <div className="order-item">
        <div className="order-item-label">&nbsp;</div>
        <div className="order-item-value flex">
          <Tooltip title="Adicionar">
            <Button
              shape="circle"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                dispatch(addOrder({ field: "date", direction: "asc" }))
              }
              style={{ marginLeft: "5px" }}
            />
          </Tooltip>
        </div>
      </div>
    </OrderContainer>
  );
}
