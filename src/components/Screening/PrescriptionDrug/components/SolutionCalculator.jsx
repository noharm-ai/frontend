import React, { useState } from "react";
import styled from "styled-components/macro";

import { InputNumber } from "components/Inputs";
import Heading from "components/Heading";
import Descriptions from "components/Descriptions";
import NumericValue from "components/NumericValue";

const CalcDescriptions = styled(Descriptions)`
  .ant-descriptions-item-label {
    text-align: right;
    font-weight: 500;
  }
`;

const CalcContainer = styled.div`
  position: relative;
  display: flex;
  background: rgb(169 145 214 / 12%);
  padding-top: 10px;

  &:before {
    content: "";
    position: absolute;
    width: 3px;
    height: 100%;
    left: 0;
    top: 0;
    background: rgb(169 145 214);
  }

  > div:nth-child(1) {
    flex: 1;
  }

  > div:nth-child(2) {
    width: 500px;
  }

  .ipt-container {
    > div {
      display: flex;
      align-items: center;
      margin-bottom: 5px;

      > div:nth-child(1) {
        flex: 1;
        justify-content: flex-end;
      }

      > div:nth-child(2) {
        width: 200px;
        padding-right: 30px;
      }
    }
  }
`;

const SolutionCalculator = ({ totalVol, amount, speed, unit, vol, weight }) => {
  const [lAmount, setAmount] = useState(amount);
  const [lTotalVol, setTotalVol] = useState(totalVol);
  const [lSpeed, setSpeed] = useState(speed);
  const [lVol, setVol] = useState(vol);
  const [lWeight, setWeight] = useState(weight);

  const result = ((lAmount * lVol) / lTotalVol) * lSpeed;
  const resultByMinute = result / 60;
  const resultByWeightHour = result / lWeight;
  const resultByWeightDay = (result / lWeight) * 24;
  const resultByWeightMinute = resultByWeightHour / 60;
  const solution = (lAmount * lVol) / lTotalVol;

  const formatValue = (value) => {
    return <NumericValue value={value} decimalScale={4} />;
  };

  return (
    <CalcContainer>
      <div className="ipt-container">
        <div>
          <div className="ipt-label">
            <Heading as="label" size="14px" textAlign="right">
              Concentração ({unit}/mL)
            </Heading>
          </div>
          <div className="ipt-value">
            <InputNumber
              style={{
                width: "100%",
                marginLeft: 10,
                marginRight: 5,
                textAlign: "right",
              }}
              min={0}
              max={999999}
              value={lAmount}
              onChange={(value) => setAmount(value)}
            />
          </div>
        </div>
        <div>
          <div className="ipt-label">
            <Heading as="label" size="14px" textAlign="right">
              Volume prescrito (mL)
            </Heading>
          </div>
          <div className="ipt-value">
            <InputNumber
              style={{
                width: "100%",
                marginLeft: 10,
                marginRight: 5,
              }}
              min={0}
              max={999999}
              value={lVol}
              onChange={(value) => setVol(value)}
            />
          </div>
        </div>
        <div>
          <div className="ipt-label">
            <Heading as="label" size="14px" textAlign="right">
              Volume da solução final (mL)
            </Heading>
          </div>
          <div className="ipt-value">
            <InputNumber
              style={{
                width: "100%",
                marginLeft: 10,
                marginRight: 5,
              }}
              min={0}
              max={999999}
              value={lTotalVol}
              onChange={(value) => setTotalVol(value)}
            />
          </div>
        </div>
        <div>
          <div className="ipt-label">
            <Heading as="label" size="14px" textAlign="right">
              Velocidade de infusão (mL/hora)
            </Heading>
          </div>
          <div className="ipt-value">
            <InputNumber
              style={{
                width: "100%",
                marginLeft: 10,
                marginRight: 5,
              }}
              min={0}
              max={999999}
              value={lSpeed}
              onChange={(value) => setSpeed(value)}
            />
          </div>
        </div>
        <div>
          <div className="ipt-label">
            <Heading as="label" size="14px" textAlign="right">
              Peso (Kg)
            </Heading>
          </div>
          <div className="ipt-value">
            <InputNumber
              style={{
                width: "100%",
                marginLeft: 10,
                marginRight: 5,
              }}
              min={0}
              max={999999}
              value={lWeight}
              onChange={(value) => setWeight(value)}
            />
          </div>
        </div>
      </div>
      <div>
        <CalcDescriptions bordered size="small">
          <Descriptions.Item
            label={
              <Heading as="label" size="14px" textAlign="right">
                Resultados
              </Heading>
            }
            span={3}
          ></Descriptions.Item>
          <Descriptions.Item label={formatValue(result)} span={3}>
            {unit}/h
          </Descriptions.Item>
          <Descriptions.Item label={formatValue(resultByMinute)} span={3}>
            {unit}/min
          </Descriptions.Item>
          <Descriptions.Item label={formatValue(resultByWeightDay)} span={3}>
            {unit}/Kg/dia
          </Descriptions.Item>
          <Descriptions.Item label={formatValue(resultByWeightHour)} span={3}>
            {unit}/Kg/h
          </Descriptions.Item>
          <Descriptions.Item label={formatValue(resultByWeightMinute)} span={3}>
            {unit}/Kg/min
          </Descriptions.Item>
          <Descriptions.Item label={formatValue(solution)} span={3}>
            {unit}/ml (solução)
          </Descriptions.Item>
        </CalcDescriptions>
      </div>
    </CalcContainer>
  );
};

export default SolutionCalculator;
