import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Space, Popover } from "antd";

import { InputNumber } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import NumericValue from "components/NumericValue";
import EditConversion from "./EditConversion";

import { ConversionDetailsPopover } from "../InterventionOutcome.style";

export default function EconomyDayCalculator({
  source,
  values,
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

  const doseStatus = () => {
    if (!values[source]?.conversion?.doseFactor) {
      return "error";
    }

    if (values[source].dose !== outcomeData[source].item.dose) {
      return "warning";
    }

    return "";
  };

  const frequencyStatus = () => {
    if (!values[source].frequencyDay) {
      return "error";
    }

    if (values[source].frequencyDay !== outcomeData[source].item.frequencyDay) {
      return "warning";
    }

    return "";
  };

  const priceStatus = () => {
    if (!values[source]?.conversion?.priceFactor || !values[source].price) {
      return "error";
    }

    if (values[source].price !== outcomeData[source].item.price) {
      return "warning";
    }

    return "";
  };

  const priceKitStatus = () => {
    if (values[source].priceKit !== outcomeData[source].item.priceKit) {
      return "warning";
    }

    return "";
  };

  if (!outcomeData) {
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
            ({outcomeData[source].item.idMeasureUnit}):
          </label>
        </div>
        <div className="form-input">
          <Space direction="horizontal">
            <InputNumber
              disabled={outcomeData.header?.readonly}
              onChange={(value) => onChangeDose(value)}
              value={values[source].dose}
              min={0}
              className={doseStatus()}
              status={doseStatus()}
            />
            <Popover
              content={
                <ConversionDetailsPopover>
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

                  <div className="form-label">
                    <label>Fator de conversão:</label>
                  </div>
                  <div className="form-value">
                    <Space direction="horizontal">
                      <EditConversion
                        idSegment={outcomeData.header?.idSegment}
                        idDrug={outcomeData[source].item.idDrug}
                        idMeasureUnit={
                          outcomeData[source].item.beforeConversion
                            .idMeasureUnit
                        }
                        idMeasureUnitConverted={
                          outcomeData[source].item.idMeasureUnit
                        }
                        factor={outcomeData[source].item.conversion.doseFactor}
                        readonly={outcomeData.header?.readonly}
                      />
                    </Space>
                  </div>

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
              className={frequencyStatus()}
              status={frequencyStatus()}
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
              precision={6}
              addonBefore="R$"
              onChange={(value) => onChangeCost(value)}
              value={values[source].price}
              className={priceStatus()}
              status={priceStatus()}
            />
            <Popover
              content={
                <ConversionDetailsPopover>
                  <div className="form-label">
                    <label>Custo registrado:</label>
                  </div>
                  <div className="form-value">
                    {outcomeData[source].item?.beforeConversion?.price &&
                    outcomeData[source].item.beforeConversion
                      .idMeasureUnitPrice ? (
                      <NumericValue
                        prefix="R$ "
                        suffix={` / ${outcomeData[source].item.beforeConversion.idMeasureUnitPrice}`}
                        value={outcomeData[source].item.beforeConversion.price}
                        decimalScale={2}
                      />
                    ) : (
                      <span style={{ color: "#ff4d4f" }}>
                        <Tooltip
                          underline
                          title="Acione o suporte para que a integração do valor de custo seja efetuada. Se desejar, você pode informar o custo manualmente."
                        >
                          Indisponível
                        </Tooltip>
                      </span>
                    )}
                  </div>

                  <div className="form-label">
                    <label>Fator de conversão:</label>
                  </div>
                  <div className="form-value">
                    <Space direction="horizontal">
                      <EditConversion
                        idSegment={outcomeData.header?.idSegment}
                        idDrug={outcomeData[source].item.idDrug}
                        idMeasureUnit={
                          outcomeData[source].item.beforeConversion
                            .idMeasureUnitPrice
                        }
                        idMeasureUnitConverted={
                          outcomeData[source].item.idMeasureUnit
                        }
                        factor={outcomeData[source].item.conversion.priceFactor}
                        readonly={outcomeData.header?.readonly}
                      />
                    </Space>
                  </div>

                  <div className="form-label">
                    <label>Custo convertido:</label>
                  </div>
                  <div className="form-value">
                    {outcomeData[source].item.price ? (
                      <NumericValue
                        prefix="R$ "
                        suffix={` / ${outcomeData[source].item.idMeasureUnit}`}
                        value={outcomeData[source].item.price}
                        decimalScale={6}
                      />
                    ) : (
                      <span style={{ color: "#ff4d4f" }}>Não informado</span>
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
              status={priceKitStatus()}
              className={priceKitStatus()}
              precision={6}
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
