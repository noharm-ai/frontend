import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Space, Popover } from "antd";

import { InputNumber } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import NumericValue from "components/NumericValue";

import { ConversionDetailsPopover } from "../InterventionOutcome.style";

export default function EconomyDayCalculator({
  source,
  values,
  errors,
  touched,
  outcomeData,
  setFieldValue,
  calcEconomyDay,
}) {
  const onChangeDose = (value) => {
    setFieldValue(`${source}.dose`, value);
    const pricePerDose = values[source].price * value + values[source].priceKit;
    setFieldValue(`${source}.pricePerDose`, pricePerDose);

    if (!values.economyDayValueManual) {
      setFieldValue(
        "economyDayValue",
        calcEconomyDay({
          ...values,
          [source]: {
            ...values[source],
            dose: value,
            pricePerDose,
          },
        })
      );
    }
  };

  const onChangeCost = (value) => {
    setFieldValue(`${source}.price`, value);
    const pricePerDose = values[source].dose * value + values[source].priceKit;
    setFieldValue(`${source}.pricePerDose`, pricePerDose);

    if (!values.economyDayValueManual) {
      setFieldValue(
        "economyDayValue",
        calcEconomyDay({
          ...values,
          [source]: {
            ...values[source],
            price: value,
            pricePerDose,
          },
        })
      );
    }
  };

  const onChangeKitCost = (value) => {
    setFieldValue(`${source}.priceKit`, value);
    const pricePerDose = values[source].dose * values[source].price + value;
    setFieldValue(`${source}.pricePerDose`, pricePerDose);

    if (!values.economyDayValueManual) {
      setFieldValue(
        "economyDayValue",
        calcEconomyDay({
          ...values,
          [source]: {
            ...values[source],
            priceKit: value,
            pricePerDose,
          },
        })
      );
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

  if (!outcomeData) {
    return null;
  }

  return (
    <>
      <div className={`form-row`}>
        <div className="form-label">
          <label>
            Dose despendida ({outcomeData[source].item.idMeasureUnit}):
          </label>
        </div>
        <div className="form-input">
          <Space direction="horizontal">
            <InputNumber
              disabled={outcomeData.header?.readonly}
              onChange={(value) => onChangeDose(value)}
              value={values[source].dose}
              min={0}
              status={!values[source]?.conversion?.doseFactor ? "error" : ""}
            />
            <Popover
              content={
                <ConversionDetailsPopover>
                  <div className="form-label">
                    <label>Dose convertida:</label>
                  </div>
                  <div className="form-value">
                    <NumericValue
                      suffix={` ${outcomeData[source].item.idMeasureUnit}`}
                      value={outcomeData[source].item.dose}
                      decimalScale={4}
                    />
                  </div>

                  <div className="form-label">
                    <label>Fator de conversão:</label>
                  </div>
                  <div className="form-value">
                    {outcomeData[source].item.conversion.doseFactor ? (
                      <NumericValue
                        suffix={`x `}
                        value={outcomeData[source].item.conversion.doseFactor}
                        decimalScale={2}
                      />
                    ) : (
                      <span style={{ color: "red" }}>Não informado</span>
                    )}
                  </div>

                  <div className="form-label">
                    <label>Dose prescrita:</label>
                  </div>
                  <div className="form-value">
                    <NumericValue
                      suffix={` ${outcomeData[source].item.beforeConversion.idMeasureUnit}`}
                      value={outcomeData[source].item.beforeConversion.dose}
                      decimalScale={4}
                    />
                  </div>
                </ConversionDetailsPopover>
              }
            >
              <Button
                icon={<InfoCircleOutlined />}
                danger={!values[source]?.conversion?.doseFactor}
              />
            </Popover>
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
              status={
                errors[source]?.frequencyDay && touched[source]?.frequencyDay
                  ? "error"
                  : null
              }
            />
            <Popover
              content={
                <ConversionDetailsPopover>
                  <div className="form-label">
                    <label>Frequência convertida:</label>
                  </div>
                  <div className="form-value">
                    <NumericValue
                      suffix={` / Dia`}
                      value={outcomeData[source].item.frequencyDay}
                      decimalScale={2}
                    />
                  </div>

                  <div className="form-label">
                    <label>Frequência prescrita:</label>
                  </div>
                  <div className="form-value">
                    {outcomeData[source].item.idFrequency}
                  </div>
                </ConversionDetailsPopover>
              }
            >
              <Button icon={<InfoCircleOutlined />} />
            </Popover>
          </Space>
        </div>
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Custo / {outcomeData[source].item.idMeasureUnit}:</label>
        </div>
        <div className="form-input">
          <Space direction="horizontal">
            <InputNumber
              disabled={outcomeData.header?.readonly}
              min={0}
              precision={2}
              addonBefore="R$"
              onChange={(value) => onChangeCost(value)}
              value={values[source].price}
              status={!values[source]?.conversion?.priceFactor ? "error" : ""}
            />
            <Popover
              content={
                <ConversionDetailsPopover>
                  <div className="form-label">
                    <label>Custo convertido:</label>
                  </div>
                  <div className="form-value">
                    {outcomeData[source].item.price ? (
                      <NumericValue
                        prefix="R$ "
                        suffix={` / ${outcomeData[source].item.idMeasureUnit}`}
                        value={outcomeData[source].item.price}
                        decimalScale={2}
                      />
                    ) : (
                      <span style={{ color: "red" }}>Não informado</span>
                    )}
                  </div>

                  <div className="form-label">
                    <label>Fator de conversão:</label>
                  </div>
                  <div className="form-value">
                    {outcomeData[source].item.conversion.priceFactor ? (
                      <NumericValue
                        suffix={`x `}
                        value={outcomeData[source].item.conversion.priceFactor}
                        decimalScale={2}
                      />
                    ) : (
                      <span style={{ color: "red" }}>Não informado (1x)</span>
                    )}
                  </div>

                  <div className="form-label">
                    <label>Custo registrado:</label>
                  </div>
                  <div className="form-value">
                    {outcomeData[source].item?.beforeConversion?.price ? (
                      <NumericValue
                        prefix="R$ "
                        suffix={` / ${outcomeData[source].item.beforeConversion.idMeasureUnitPrice}`}
                        value={outcomeData[source].item.beforeConversion.price}
                        decimalScale={2}
                      />
                    ) : (
                      <span style={{ color: "red" }}>Não informado</span>
                    )}
                  </div>
                </ConversionDetailsPopover>
              }
            >
              <Button
                icon={<InfoCircleOutlined />}
                danger={!values[source]?.conversion?.priceFactor}
              />
            </Popover>
          </Space>
        </div>
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Custo KIT:</label>
        </div>
        <div className="form-input">
          <Space direction="horizontal">
            <InputNumber
              disabled={outcomeData.header?.readonly}
              min={0}
              addonBefore="R$"
              onChange={(value) => onChangeKitCost(value)}
              value={values[source].priceKit}
              status={
                errors[source]?.priceKit && touched[source]?.priceKit
                  ? "error"
                  : null
              }
            />
            <Tooltip title="Custo dos componentes">
              <Button icon={<InfoCircleOutlined />} />
            </Tooltip>
          </Space>
        </div>
      </div>
    </>
  );
}
