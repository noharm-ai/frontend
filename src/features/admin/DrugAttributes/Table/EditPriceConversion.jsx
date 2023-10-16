import "styled-components/macro";
import React, { useState } from "react";
import { CheckOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "components/Button";
import { InputNumber } from "components/Inputs";
import notification from "components/notification";
import { updatePriceFactor } from "../DrugAttributesSlice";
import { getErrorMessage } from "utils/errorHandler";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";

export default function EditPriceConversion({
  idDrug,
  idSegment,
  idMeasureUnitPrice,
  factor,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(factor === null ? "-" : factor);

  const handleClick = (event) => {
    event.preventDefault();
    setEdit(true);
  };

  const handleSave = () => {
    if (value === null || isNaN(value)) {
      notification.error({ message: "Valor inválido" });
      return;
    }
    setSaving(true);

    const params = {
      idDrug,
      idSegment,
      factor: value,
    };

    dispatch(updatePriceFactor(params)).then((response) => {
      setSaving(false);
      setEdit(false);

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

  const cancel = () => {
    setValue(factor);
    setEdit(false);
  };

  if (!idMeasureUnitPrice) {
    return (
      <Tooltip title="Este medicamento não possui unidade de custo, por isso não pode ser editado">
        <Tag>Indisponível</Tag>
      </Tooltip>
    );
  }

  return edit ? (
    <span>
      <InputNumber
        style={{
          marginRight: 8,
          width: 100,
        }}
        defaultValue={value === "-" ? 0 : value}
        onChange={setValue}
        autoFocus={true}
        onPressEnter={handleSave}
        min={0}
        max={99999999}
      />
      <Button
        type="primary gtm-bt-change-daily-frequency"
        onClick={handleSave}
        icon={<CheckOutlined />}
        loading={saving}
      ></Button>
      <Button
        onClick={cancel}
        icon={<CloseOutlined />}
        loading={saving}
        size="small"
        style={{
          marginLeft: 8,
        }}
      ></Button>
    </span>
  ) : (
    <>
      <span css="margin-right: 10px;">
        {value === "-" || value === null ? <Tag color="red">Vazio</Tag> : value}
      </span>
      {/*eslint-disable-next-line*/}
      <a href="#" css="color: inherit;" onClick={handleClick}>
        <EditOutlined />
      </a>
    </>
  );
}
