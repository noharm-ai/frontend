import React, { useState } from "react";
import styled from "styled-components/macro";
import { Row, Col } from "antd";

import { InputNumber } from "components/Inputs";
import Heading from "components/Heading";
import Card from "components/Card";
import Descriptions from "components/Descriptions";

const SolutionCalculator = ({ totalVol, amount, speed, unit, vol, weight }) => {
  const gutter = [0, 12];
  const [lAmount, setAmount] = useState(amount);
  const [lTotalVol, setTotalVol] = useState(totalVol);
  const [lSpeed, setSpeed] = useState(speed);
  const [lVol, setVol] = useState(vol);
  const [lWeight, setWeight] = useState(weight);

  const result = ((lAmount * lVol) / lTotalVol) * lSpeed;
  const resultByMinute = result / 60;
  const resultByWeightHour = result / lWeight;
  const resultByWeightMinute = resultByWeightHour / 60;
  const solution = (lAmount * lVol) / lTotalVol;

  const CalcDescriptions = styled(Descriptions)`
    .ant-descriptions-item-label {
      text-align: right;
      font-weight: 500;
    }
  `;

  const formatValue = (value) => {
    return value.toFixed(4);
  };

  const labelSize = 14;
  const inputSize = 10;

  return (
    <Card title="Calculadora de solução">
      <Row>
        <Col xs={24} md={14}>
          <Row gutter={gutter} type="flex" align="middle">
            <Col xs={labelSize}>
              <Heading as="label" size="14px" textAlign="right">
                Concentração ({unit}/mL)
              </Heading>
            </Col>
            <Col xs={inputSize}>
              <InputNumber
                style={{
                  width: 120,
                  marginLeft: 10,
                  marginRight: 5,
                  textAlign: "right",
                }}
                min={0}
                max={999999}
                value={lAmount}
                onChange={(value) => setAmount(value)}
              />
            </Col>
          </Row>
          <Row gutter={gutter} type="flex" align="middle">
            <Col xs={labelSize}>
              <Heading as="label" size="14px" textAlign="right">
                Volume prescrito (mL)
              </Heading>
            </Col>
            <Col xs={inputSize}>
              <InputNumber
                style={{
                  width: 120,
                  marginLeft: 10,
                  marginRight: 5,
                }}
                min={0}
                max={999999}
                value={lVol}
                onChange={(value) => setVol(value)}
              />
            </Col>
          </Row>
          <Row gutter={gutter} type="flex" align="middle">
            <Col xs={labelSize}>
              <Heading as="label" size="14px" textAlign="right">
                Volume da solução final (mL)
              </Heading>
            </Col>
            <Col xs={inputSize}>
              <InputNumber
                style={{
                  width: 120,
                  marginLeft: 10,
                  marginRight: 5,
                }}
                min={0}
                max={999999}
                value={lTotalVol}
                onChange={(value) => setTotalVol(value)}
              />
            </Col>
          </Row>
          <Row gutter={gutter} type="flex" align="middle">
            <Col xs={labelSize}>
              <Heading as="label" size="14px" textAlign="right">
                Velocidade de infusão (mL/hora)
              </Heading>
            </Col>
            <Col xs={inputSize}>
              <InputNumber
                style={{
                  width: 120,
                  marginLeft: 10,
                  marginRight: 5,
                }}
                min={0}
                max={999999}
                value={lSpeed}
                onChange={(value) => setSpeed(value)}
              />
            </Col>
          </Row>
          <Row gutter={gutter} type="flex" align="middle">
            <Col xs={labelSize}>
              <Heading as="label" size="14px" textAlign="right">
                Peso (Kg)
              </Heading>
            </Col>
            <Col xs={inputSize}>
              <InputNumber
                style={{
                  width: 120,
                  marginLeft: 10,
                  marginRight: 5,
                }}
                min={0}
                max={999999}
                value={lWeight}
                onChange={(value) => setWeight(value)}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} md={10}>
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
            <Descriptions.Item label={formatValue(resultByWeightHour)} span={3}>
              {unit}/Kg/h
            </Descriptions.Item>
            <Descriptions.Item
              label={formatValue(resultByWeightMinute)}
              span={3}
            >
              {unit}/Kg/min
            </Descriptions.Item>
            <Descriptions.Item label={formatValue(solution)} span={3}>
              {unit}/ml (solução)
            </Descriptions.Item>
          </CalcDescriptions>
        </Col>
      </Row>
    </Card>
  );
};

export default SolutionCalculator;
