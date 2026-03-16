import "styled-components";
import React from "react";
import { EditOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import Big from "big.js";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import NumericValue from "components/NumericValue";
import {
  trackInterventionOutcomeAction,
  TrackedInterventionOutcomeAction,
} from "src/utils/tracker";
import { setDrugUnitConversionOpen } from "src/features/drugs/DrugUnitConversion/DrugUnitConversionSlice";

export default function EditConversion({
  idDrug,
  idMeasureUnit,
  idMeasureUnitConverted,
  factor,
  readonly,
}) {
  const dispatch = useDispatch();

  const handleClick = (event) => {
    event.preventDefault();
    dispatch(setDrugUnitConversionOpen({ open: true, idDrug: String(idDrug) }));

    trackInterventionOutcomeAction(
      TrackedInterventionOutcomeAction.EDIT_CONVERSION,
    );
  };

  if (!idMeasureUnit) {
    return (
      <Tooltip title="Este medicamento não possui unidade de medida, por isso não pode ser editado">
        <Tag>Indisponível</Tag>
      </Tooltip>
    );
  }

  return (
    <>
      <span css="margin-right: 10px;">
        {factor === null || factor === "-" ? (
          <Tag color="red">Vazio</Tag>
        ) : (
          <NumericValue value={Big(factor || 1).toNumber()} decimalScale={6} />
        )}
      </span>
      <Tooltip title="Editar fator de conversão">
        <Button
          onClick={handleClick}
          icon={<EditOutlined />}
          disabled={idMeasureUnit === idMeasureUnitConverted || readonly}
          size="small"
        />
      </Tooltip>
    </>
  );
}
