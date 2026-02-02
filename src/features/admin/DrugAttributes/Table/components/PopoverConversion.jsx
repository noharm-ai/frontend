import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { Popover, InputNumber, Space } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import Button from "components/Button";
import notification from "components/notification";
import { ConversionDetailsPopover } from "../EditMaxDose.style";
import { updateSubstanceUnitFactor } from "../../DrugAttributesSlice";
import { getErrorMessage } from "utils/errorHandler";

export function PopoverConversion({
  measureUnitOrigin,
  measureUnitDestination,
  idDrug,
  idSegment,
  children,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [factor, setFactor] = useState(null);
  const [saving, setSaving] = useState(false);
  const iptRef = useRef(null);

  const save = () => {
    if (!factor) {
      notification.error({ message: "Valor inválido" });
      return;
    }
    setSaving(true);

    const params = {
      idDrug,
      idSegment,
      factor,
    };

    dispatch(updateSubstanceUnitFactor(params)).then((response) => {
      setSaving(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Conversão atualizada!",
        });
      }
    });
  };

  return (
    <Popover
      trigger={["click"]}
      onOpenChange={(open) => {
        if (!open) {
          setFactor(null);
          setSaving(false);
        } else {
          setTimeout(() => {
            if (iptRef?.current) {
              iptRef.current.focus();
            }
          }, 100);
        }
      }}
      content={
        <ConversionDetailsPopover>
          <div>1 {measureUnitDestination} = </div>

          <Space.Compact>
            <InputNumber
              value={factor}
              onChange={(val) => setFactor(val)}
              autoFocus={true}
              min={0}
              max={99999999}
              style={{ marginLeft: "0.5rem", width: "150px" }}
              ref={iptRef}
              onPressEnter={save}
            />
            <Space.Addon>{measureUnitOrigin}</Space.Addon>
          </Space.Compact>

          <Button
            icon={<CheckOutlined />}
            disabled={!factor}
            loading={saving}
            style={{ marginLeft: "0.5rem" }}
            onClick={save}
          ></Button>
        </ConversionDetailsPopover>
      }
    >
      {children}
    </Popover>
  );
}
