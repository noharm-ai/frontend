import React from "react";
import "styled-components/macro";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { Col } from "components/Grid";
import Heading from "components/Heading";
import { InputNumber, Select, DatePicker } from "components/Inputs";
import Tooltip from "components/Tooltip";
import Editor from "components/Editor";

import { Box, EditorBox } from "../Form.style";

export default function Base({ featureService }) {
  const { values, setFieldValue, errors } = useFormikContext();
  const {
    weight,
    height,
    observation,
    dialysis,
    gender,
    birthdate,
    skinColor,
  } = values;
  const layout = { label: 8, input: 16 };
  const { t } = useTranslation();

  return (
    <>
      <Box hasError={errors.weight}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Peso:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <InputNumber
            style={{
              width: 120,
              marginLeft: 10,
              marginRight: 5,
            }}
            min={0}
            max={99999}
            value={weight}
            onChange={(value) => setFieldValue("weight", value)}
          />{" "}
          Kg
        </Col>
      </Box>

      <Box hasError={errors.height}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">Altura:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <InputNumber
            style={{
              width: 120,
              marginLeft: 10,
              marginRight: 5,
            }}
            min={0}
            max={99999}
            value={height}
            onChange={(value) => setFieldValue("height", value)}
          />{" "}
          cm
        </Col>
      </Box>

      <Box hasError={errors.dialysis}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">{t("labels.dialysis")}:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            optionFilterProp="children"
            style={{
              marginLeft: 10,
              width: "100%",
            }}
            value={dialysis}
            onChange={(value) => setFieldValue("dialysis", value)}
          >
            <Select.Option value={null}>Não informado</Select.Option>
            <Select.Option value="c">Contínua</Select.Option>
            <Select.Option value="v">Convencional</Select.Option>
            <Select.Option value="x">Estendida</Select.Option>
            <Select.Option value="0">Não realiza</Select.Option>
            <Select.Option value="p">Peritoneal</Select.Option>
          </Select>
        </Col>
      </Box>

      <Box hasError={errors.gender}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">{t("labels.gender")}:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            optionFilterProp="children"
            style={{
              marginLeft: 10,
              width: "100%",
            }}
            value={gender}
            onChange={(value) => setFieldValue("gender", value)}
          >
            <Select.Option value={null}>Não informado</Select.Option>
            <Select.Option value="M">Masculino</Select.Option>
            <Select.Option value="F">Feminino</Select.Option>
          </Select>
        </Col>
      </Box>

      <Box hasError={errors.skinColor}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">{t("labels.skinColor")}:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            optionFilterProp="children"
            style={{
              marginLeft: 10,
              width: "100%",
            }}
            value={skinColor}
            onChange={(value) => setFieldValue("skinColor", value)}
          >
            <Select.Option value={null}>Não informado</Select.Option>
            <Select.Option value="Amarela">Amarela</Select.Option>
            <Select.Option value="Branca">Branca</Select.Option>
            <Select.Option value="Índio">Índio</Select.Option>
            <Select.Option value="Negra">Negra</Select.Option>
            <Select.Option value="Parda">Parda</Select.Option>
          </Select>
        </Col>
      </Box>

      <Box hasError={errors.birthdate}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">{t("labels.birthdate")}:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <DatePicker
            format="DD/MM/YYYY"
            value={birthdate ? moment(birthdate) : null}
            onChange={(value) =>
              setFieldValue(
                "birthdate",
                value ? value.format("YYYY-MM-DD") : null
              )
            }
            popupClassName="noArrow"
            allowClear={true}
            showTime
            style={{
              marginLeft: 10,
              width: "100%",
            }}
          />
        </Col>
      </Box>

      <Box hasError={errors.observation}>
        <Col xs={24} style={{ paddingBottom: "0" }}>
          <Heading as="label" size="14px">
            <Tooltip title="">Anotações:</Tooltip>
          </Heading>
        </Col>
        <Col xs={24}>
          <EditorBox>
            <Editor
              onEdit={(value) => setFieldValue("observation", value)}
              content={observation || ""}
              onReady={(editor) => {
                editor.editing.view.focus();
              }}
            />
          </EditorBox>
        </Col>
      </Box>
    </>
  );
}
