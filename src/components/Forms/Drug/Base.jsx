import React from 'react';
import 'styled-components/macro';
import { useFormikContext } from 'formik';
import { Checkbox } from 'antd';

import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import { InputNumber, Select } from '@components/Inputs';
import Tooltip from '@components/Tooltip';

import { Box } from './Drug.style';

export default function Base() {
  const { values, setFieldValue, errors } = useFormikContext();
  const {
    antimicro,
    mav,
    controlled,
    notdefault,
    maxDose,
    price,
    maxTime,
    kidney,
    liver,
    platelets,
    elderly,
    tube,
    unit,
    useWeight,
    amount,
    amountUnit,
    whiteList
  } = values;

  return (
    <>
      <Col md={24} xs={24}>
        <Box css="align-items: flex-start;">
          <Heading as="label" size="14px" className="fixed" css="margin-top: 12px;">
            Classificação:
          </Heading>
          <div style={{ width: '535px' }}>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('antimicro', !target.value)}
                value={antimicro}
                checked={antimicro}
                name="antimicro"
                id="antimicro"
              >
                Antimicrobiano
              </Checkbox>
            </Col>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('mav', !target.value)}
                value={mav}
                checked={mav}
                name="mav"
                id="mav"
              >
                Alta vigilância
              </Checkbox>
            </Col>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('controlled', !target.value)}
                value={controlled}
                checked={controlled}
                name="controlled"
                id="controlled"
              >
                Controlados
              </Checkbox>
            </Col>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('notdefault', !target.value)}
                value={notdefault}
                checked={notdefault}
                name="notdefault"
                id="notdefault"
              >
                Não padronizado
              </Checkbox>
            </Col>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('elderly', !target.value)}
                value={elderly}
                checked={elderly}
                name="elderly"
                id="elderly"
              >
                <Tooltip title="Medicamento Potencialmente Inapropriado para Idosos" underline>
                  MPI
                </Tooltip>
              </Checkbox>
            </Col>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('whiteList', !target.value)}
                value={whiteList}
                checked={whiteList}
                name="whiteList"
                id="whiteList"
              >
                <Tooltip title="Medicamento isento de Validação e Escore (Ex.: Diluentes)" underline>
                  Sem validação
                </Tooltip>
              </Checkbox>
            </Col>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('tube', !target.value)}
                value={tube}
                checked={tube}
                name="tube"
                id="tube"
              >
                <Tooltip title="Medicamento contraindicado via Sonda Nasoenteral, Nasogástrica, Enteral, Jejunostomia ou Gastrostomia" underline>
                  Sonda
                </Tooltip>
              </Checkbox>
            </Col>
          </div>
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.price}>
          <Heading as="label" size="14px" className="fixed">
            Custo:
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={price}
            onChange={value => setFieldValue('price', value)}
          />
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.maxTime}>
          <Heading as="label" size="14px" className="fixed">
            Alerta de Tempo de Tratamento
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={maxTime}
            onChange={value => setFieldValue('maxTime', value)}
          />{' dias'}
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.maxDose}>
          <Heading as="label" size="14px" className="fixed">
            <Tooltip title="Dose de Alerta Diária">Dose de Alerta:</Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={maxDose}
            onChange={value => setFieldValue('maxDose', value)}
          />{' '}
          {unit}
          {useWeight ? '/Kg/dia' : ''}
        </Box>
      </Col>
      <Col md={24} xs={24}>
        <Box hasError={errors.kidney}>
          <Heading as="label" size="14px" margin="0 0 10px" className="fixed">
            <Tooltip
              title="Valor de Taxa de Filtração Glomerular (CKD-EPI) a partir do qual o medicamento deve sofrer ajuste de dose ou frequência."
              underline
            >
              Nefrotóxico:
            </Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginRight: 5
            }}
            min={0}
            max={100}
            value={kidney}
            onChange={value => setFieldValue('kidney', value)}
          />
          mL/min
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.liver}>
          <Heading as="label" size="14px" className="fixed">
            <Tooltip
              title="Valor de TGO ou TGP a partir do qual o medicamento deve sofrer ajuste de dose ou frequência."
              underline
            >
              Hepatotóxico:
            </Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={liver}
            onChange={value => setFieldValue('liver', value)}
          />
          U/L
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.platelets}>
          <Heading as="label" size="14px" className="fixed">
            <Tooltip
              title="Valor de Plauqetas/µL abaixo do qual o uso do medicamento é inadequado."
              underline
            >
              Alerta de Plaquetas:
            </Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginRight: 5
            }}
            min={0}
            max={999999}
            value={platelets}
            onChange={value => setFieldValue('platelets', value)}
          />
          plaquetas/µL
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.amount}>
          <Heading as="label" size="14px" className="fixed">
            <Tooltip title="Informação que será utilizada na calculadora de soluções" underline>
              Concentração:
            </Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginRight: '10px'
            }}
            min={0}
            max={99999}
            value={amount}
            onChange={value => setFieldValue('amount', value)}
          />
        </Box>
      </Col>
      <Col md={24} xs={24}>
        <Box hasError={errors.amountUnit}>
          <Heading as="label" size="14px" className="fixed">
            Unidade da concentração:
          </Heading>
          <Select
            placeholder="Selecione a unidade da concentração"
            onChange={value => setFieldValue('amountUnit', value)}
            value={amountUnit}
            identify="amountUnit"
            allowClear
            style={{ minWidth: '300px' }}
          >
            <Select.Option value="" key=""></Select.Option>
            <Select.Option value="mEq" key="mEq">
              mEq
            </Select.Option>
            <Select.Option value="mg" key="mg">
              mg
            </Select.Option>
            <Select.Option value="mcg" key="mcg">
              mcg
            </Select.Option>
            <Select.Option value="U" key="U">
              U
            </Select.Option>
            <Select.Option value="UI" key="UI">
              UI
            </Select.Option>
          </Select>{' '}
          &nbsp; /mL
        </Box>
      </Col>
    </>
  );
}
