import "styled-components/macro";
import React, { useState, useEffect } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "components/Button";
import { InputNumber } from "components/Inputs";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import Tooltip from "components/Tooltip";

import { saveDrugAttributes } from "features/drugs/DrugAttributesForm/DrugAttributesFormSlice";

export default function EditMaxDose({
  idDrug,
  idSegment,
  maxDose,
  measureUnitDefaultName,
  useWeight,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(maxDose);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    setValue(maxDose);
  }, [maxDose]);

  const handleSave = () => {
    if (value === null) {
      notification.error({ message: "Valor inválido" });
      return;
    }
    setSaving(true);

    const params = {
      idDrug,
      idSegment,
      maxDose: value,
    };

    dispatch(saveDrugAttributes(params)).then((response) => {
      setSaving(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setUpdated(true);
        notification.success({
          message: "Dose máxima atualizada!",
        });
      }
    });
  };

  return (
    <div>
      <span style={{ width: "500px", display: "flex", alignItems: "center" }}>
        <InputNumber
          style={{
            marginRight: 5,
          }}
          min={0}
          max={999999999}
          value={value}
          onChange={(newValue) => setValue(newValue)}
          addonAfter={
            useWeight ? `${measureUnitDefaultName}/Kg` : measureUnitDefaultName
          }
          disabled={!idSegment || !measureUnitDefaultName}
        />

        {!measureUnitDefaultName ? (
          <>Unidade de medida padrão indefinida</>
        ) : (
          <Tooltip title="Salvar">
            <Button
              type="primary"
              ghost={!updated}
              onClick={handleSave}
              icon={<CheckOutlined />}
              loading={saving}
              disabled={!idSegment}
            ></Button>
          </Tooltip>
        )}
      </span>
    </div>
  );
}
