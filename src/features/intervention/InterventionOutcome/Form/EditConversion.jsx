import "styled-components/macro";
import React, { useState } from "react";
import { CheckOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "components/Button";
import { InputNumber } from "components/Inputs";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import {
  upsertDrugMeasureUnit,
  fetchInterventionOutcomeData,
} from "../InterventionOutcomeSlice";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";

export default function EditConversion({
  idDrug,
  idSegment,
  idMeasureUnit,
  idMeasureUnitConverted,
  factor,
  readonly,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const selectedIntervention = useSelector(
    (state) => state.interventionOutcome.selectedIntervention
  );
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
      idMeasureUnit,
      factor: value,
    };

    dispatch(upsertDrugMeasureUnit(params)).then((response) => {
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

        dispatch(
          fetchInterventionOutcomeData({
            idIntervention: selectedIntervention.idIntervention,
          })
        );
      }
    });
  };

  const cancel = () => {
    setValue(factor);
    setEdit(false);
  };

  if (!idMeasureUnit) {
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
        type="primary"
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
      <Tooltip title="Editar fator de conversão">
        <Button
          onClick={handleClick}
          icon={<EditOutlined />}
          loading={saving}
          disabled={idMeasureUnit === idMeasureUnitConverted || readonly}
          size="small"
        ></Button>
      </Tooltip>
    </>
  );
}
