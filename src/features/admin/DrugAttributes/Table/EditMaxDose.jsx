import "styled-components/macro";
import React, { useState, useEffect } from "react";
import {
  CheckOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Space } from "antd";

import Button from "components/Button";
import { InputNumber } from "components/Inputs";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import Tooltip from "components/Tooltip";
import NumericValue from "components/NumericValue";
import { PopoverConversion } from "./components/PopoverConversion";
import { MaxDoseReferenceContainer } from "./EditMaxDose.style";

import { saveDrugAttributes } from "features/drugs/DrugAttributesForm/DrugAttributesFormSlice";

export default function EditMaxDose({
  idDrug,
  idSegment,
  maxDose,
  measureUnitDefaultName,
  useWeight,
  record,
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

    save(value);
  };

  const save = (maxDose) => {
    const params = {
      idDrug,
      idSegment,
      maxDose,
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

  const applyValue = (value) => {
    if (value === null) {
      notification.error({ message: "Valor inválido" });
      return;
    }
    setValue(value);
    save(value);
  };

  const cleanValue = () => {
    setValue(null);
    save(null);
  };

  return (
    <div>
      <span style={{ width: "500px", display: "flex", alignItems: "center" }}>
        <InputNumber
          style={{
            marginRight: 5,
            width: "370px",
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
          <>Unidade padrão indefinida</>
        ) : (
          <Space>
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
            <Tooltip title="Remover">
              <Button
                onClick={cleanValue}
                icon={<DeleteOutlined />}
                loading={saving}
                disabled={!value}
                shape="circle"
                danger
              ></Button>
            </Tooltip>
          </Space>
        )}
      </span>
      <MaxDoseReferenceContainer>
        <div className="ref-item">
          <div className="ref-label">Convertida:</div>
          <div className="ref-value">
            {record?.refMaxDose ? (
              <NumericValue value={record?.refMaxDose} />
            ) : (
              <span className="empty">--</span>
            )}
          </div>
          <div className="ref-unit">
            {record?.measureUnitDefaultName || "Unidade indefinida"}
          </div>
          <div className="ref-action">
            <Tooltip title="Aplicar dose máxima">
              <Button
                icon={<ArrowUpOutlined />}
                onClick={() => applyValue(record?.refMaxDose)}
                disabled={!record?.refMaxDose}
                loading={saving}
              ></Button>
            </Tooltip>
          </div>
        </div>

        <div className="ref-item">
          <div className="ref-label">Convertida/Kg:</div>
          <div className="ref-value">
            {record?.refMaxDoseWeight ? (
              <NumericValue value={record?.refMaxDoseWeight} />
            ) : (
              <span className="empty">--</span>
            )}
          </div>
          <div className="ref-unit">
            {(record?.measureUnitDefaultName || "Unidade indefinida") + "/Kg"}
          </div>
          <div className="ref-action">
            <Tooltip title="Aplicar dose máxima">
              <Button
                icon={<ArrowUpOutlined />}
                onClick={() => applyValue(record?.refMaxDoseWeight)}
                disabled={!record?.refMaxDoseWeight}
                loading={saving}
              ></Button>
            </Tooltip>
          </div>
        </div>

        <div className="ref-item">
          <div className="ref-label">Referência:</div>
          <div className="ref-value">
            {record?.substanceMaxDose ? (
              <NumericValue value={record?.substanceMaxDose} />
            ) : (
              <span className="empty">--</span>
            )}
          </div>
          <div className="ref-unit">
            {record?.substanceMeasureUnit || "Unidade indefinida"}
          </div>
          <div className="ref-action">
            <PopoverConversion
              measureUnitOrigin={record?.substanceMeasureUnit}
              measureUnitDestination={record?.idMeasureUnitDefault}
              idDrug={record?.idDrug}
              idSegment={record?.idSegment}
            >
              <Tooltip title="Converter" placement="right">
                <Button
                  icon={<RetweetOutlined />}
                  disabled={
                    record?.measureUnitNH === record?.substanceMeasureUnit ||
                    !record?.substanceMaxDose ||
                    !record?.idMeasureUnitDefault
                  }
                ></Button>
              </Tooltip>
            </PopoverConversion>
          </div>
        </div>

        <div className="ref-item">
          <div className="ref-label">Referência/Kg:</div>
          <div className="ref-value">
            {record?.substanceMaxDoseWeight ? (
              <NumericValue value={record?.substanceMaxDoseWeight} />
            ) : (
              <span className="empty">--</span>
            )}
          </div>
          <div className="ref-unit">
            {(record?.substanceMeasureUnit || "Unidade indefinida") + "/Kg"}
          </div>
          <div className="ref-action">
            <PopoverConversion
              measureUnitOrigin={record?.substanceMeasureUnit}
              measureUnitDestination={record?.idMeasureUnitDefault}
              idDrug={record?.idDrug}
              idSegment={record?.idSegment}
            >
              <Tooltip title="Converter" placement="right">
                <Button
                  icon={<RetweetOutlined />}
                  disabled={
                    record?.measureUnitNH === record?.substanceMeasureUnit ||
                    !record?.substanceMaxDoseWeight ||
                    !record?.idMeasureUnitDefault
                  }
                ></Button>
              </Tooltip>
            </PopoverConversion>
          </div>
        </div>
      </MaxDoseReferenceContainer>
    </div>
  );
}
