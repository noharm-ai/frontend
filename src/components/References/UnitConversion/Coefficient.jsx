import "styled-components";
import React, { useState } from "react";
import { CheckOutlined, StarOutlined, EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import { InputNumber } from "components/Inputs";
import Tooltip from "components/Tooltip";

export default function Escore({ record }) {
  const {
    idMeasureUnit,
    fator,
    saveUnitCoefficient,
    updateDrugData,
    defaultIdMeasureUnit,
  } = record;
  const [edit, setEdit] = useState(false);
  const [coefficient, setCoefficient] = useState(fator || 0);

  const handleClick = (event) => {
    event.preventDefault();
    setEdit(true);
  };

  const handleSave = () => {
    setEdit(false);
    saveUnitCoefficient(idMeasureUnit, {
      fator: coefficient,
    });
    updateDrugData({ touched: true });
  };

  return edit ? (
    <>
      <InputNumber
        style={{
          marginRight: 8,
          width: 80,
        }}
        defaultValue={coefficient}
        onChange={setCoefficient}
      />
      <Button
        type="primary"
        className="gtm-bt-save-factor"
        onClick={handleSave}
        icon={<CheckOutlined />}
      ></Button>
    </>
  ) : (
    <>
      <span css="margin-right: 10px;">{fator}</span>

      {idMeasureUnit !== defaultIdMeasureUnit && (
        <>
          {/*eslint-disable-next-line*/}
          <a href="#" css="color: inherit;" onClick={handleClick}>
            <EditOutlined />
          </a>
        </>
      )}
      {idMeasureUnit === defaultIdMeasureUnit && (
        <Tooltip title="Unidade padrão">
          <StarOutlined />
        </Tooltip>
      )}
    </>
  );
}
