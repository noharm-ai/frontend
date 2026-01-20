import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Space } from "antd";
import Big from "big.js";

import { InputNumber } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import PopoverPrice from "./Details/PopoverPrice";
import PopoverDose from "./Details/PopoverDose";
import PopoverFrequency from "./Details/PopoverFrequency";
import PopoverKit from "./Details/PopoverKit";

const INPUT_PRECISION = 6;

export default function EconomyDayCalculator({
  source,
  values,
  outcomeData,
  setFieldValue,
  calcEconomyDay,
}) {
  const onChangeParam = (field, value) => {
    setFieldValue(`${source}.${field}`, value);

    const newValues = {
      ...values,
      [source]: {
        ...values[source],
        [field]: value,
      },
    };

    const pricePerDose = Big(newValues[source].price || 0)
      .times(Big(newValues[source].dose || 0))
      .plus(Big(newValues[source].priceKit || 0));

    setFieldValue(`${source}.pricePerDose`, pricePerDose);
    newValues[source].pricePerDose = pricePerDose;

    if (!values.economyDayValueManual) {
      setFieldValue("economyDayValue", calcEconomyDay(newValues));
    }
  };

  const onChangeFrequencyDay = (value) => {
    setFieldValue(`${source}.frequencyDay`, value);

    if (!values.economyDayValueManual) {
      setFieldValue(
        "economyDayValue",
        calcEconomyDay({
          ...values,
          [source]: {
            ...values[source],
            frequencyDay: value,
          },
        })
      );
    }
  };

  const fieldStatus = (field) => {
    if (field === "dose") {
      if (!values[source]?.conversion?.doseFactor) {
        return "error";
      }
    }

    if (field === "price") {
      if (!values[source]?.conversion?.priceFactor || !values[source].price) {
        return "error";
      }
    }

    //all
    if (!values[source][field] && field !== "priceKit") {
      return "error";
    }

    if (
      !Big(values[source][field] || 0).eq(
        Big(outcomeData[source].item[field] || 0)
      )
    ) {
      return "warning";
    }

    return false;
  };

  if (!outcomeData || !outcomeData[source]) {
    return null;
  }

  return (
    <>
      <div className={`form-row`}>
        <div className="form-label">
          <label>
            <Tooltip
              underline
              title="Dose dispensada é a dose despendida para cada horário, conforme rotina de cada unidade de saúde"
            >
              Dose dispensada
            </Tooltip>{" "}
            {outcomeData[source].item.idMeasureUnit ? (
              <Tooltip underline title="Unidade padrão">
                <span style={{ fontSize: "12px" }}>
                  ({outcomeData[source].item.measureUnitDescription})
                </span>
              </Tooltip>
            ) : (
              <Tooltip underline title="Unidade padrão não informada">
                <span style={{ color: "red", fontSize: "12px" }}>
                  (Unidade inválida)
                </span>
              </Tooltip>
            )}
            :
          </label>
        </div>
        <div className="form-input">
          <Space direction="horizontal">
            <InputNumber
              disabled={outcomeData.header?.readonly}
              onChange={(value) => onChangeParam("dose", value)}
              value={values[source].dose}
              min={0}
              className={fieldStatus("dose")}
              status={fieldStatus("dose")}
              stringMode
              precision={INPUT_PRECISION}
            />
            <PopoverDose outcomeData={outcomeData} source={source}>
              <Button
                icon={<InfoCircleOutlined />}
                danger={!values[source]?.conversion?.doseFactor}
              />
            </PopoverDose>
          </Space>
        </div>
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Frequência/Dia:</label>
        </div>
        <div className="form-input">
          <Space direction="horizontal">
            <InputNumber
              disabled={outcomeData.header?.readonly}
              min={0}
              onChange={(value) => onChangeFrequencyDay(value)}
              value={values[source].frequencyDay}
              className={fieldStatus("frequencyDay")}
              status={fieldStatus("frequencyDay")}
              stringMode
              precision={INPUT_PRECISION}
            />
            <PopoverFrequency outcomeData={outcomeData} source={source}>
              <Button icon={<InfoCircleOutlined />} />
            </PopoverFrequency>
          </Space>
        </div>
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>
            Custo /{" "}
            {outcomeData[source].item.idMeasureUnit ? (
              <Tooltip underline title="Unidade padrão">
                <span style={{ fontSize: "12px" }}>
                  ({outcomeData[source].item.measureUnitDescription})
                </span>
              </Tooltip>
            ) : (
              <Tooltip underline title="Unidade padrão não informada">
                <span style={{ color: "red", fontSize: "12px" }}>
                  (Unidade inválida)
                </span>
              </Tooltip>
            )}
            :
          </label>
        </div>
        <div className="form-input input-price">
          <Space direction="horizontal">
            <Space.Compact block>
              <Space.Addon>R$</Space.Addon>
              <InputNumber
                disabled={outcomeData.header?.readonly}
                min={0}
                precision={INPUT_PRECISION}
                onChange={(value) => onChangeParam("price", value)}
                value={values[source].price}
                className={fieldStatus("price")}
                status={fieldStatus("price")}
                stringMode
              />
            </Space.Compact>

            <PopoverPrice outcomeData={outcomeData} source={source}>
              <Button
                icon={<InfoCircleOutlined />}
                danger={!values[source]?.conversion?.priceFactor}
              />
            </PopoverPrice>
          </Space>
        </div>
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Custo KIT:</label>
        </div>
        <div className="form-input input-price-kit">
          <Space direction="horizontal">
            <Space.Compact block>
              <Space.Addon>R$</Space.Addon>
              <InputNumber
                disabled={outcomeData.header?.readonly}
                min={0}
                onChange={(value) => onChangeParam("priceKit", value)}
                value={values[source].priceKit}
                className={fieldStatus("priceKit")}
                status={fieldStatus("priceKit")}
                precision={INPUT_PRECISION}
                stringMode
              />
            </Space.Compact>

            <PopoverKit outcomeData={outcomeData} source={source}>
              <Button icon={<InfoCircleOutlined />} />
            </PopoverKit>
          </Space>
        </div>
      </div>
    </>
  );
}
