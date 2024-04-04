import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Space } from "antd";

import { InputNumber } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import PopoverPrice from "./Details/PopoverPrice";
import PopoverDose from "./Details/PopoverDose";
import PopoverFrequency from "./Details/PopoverFrequency";
import PopoverKit from "./Details/PopoverKit";

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
              className={frequencyStatus()}
              status={frequencyStatus()}
            />
            <PopoverFrequency outcomeData={outcomeData} source={source}>
              <Button icon={<InfoCircleOutlined />} />
            </PopoverFrequency>
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
            <PopoverKit outcomeData={outcomeData} source={source}>
              <Button icon={<InfoCircleOutlined />} />
            </PopoverKit>
          </Space>
        </div>
      </div>
    </>
  );
}
