import React from "react";
import "styled-components/macro";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { Col } from "components/Grid";
import Heading from "components/Heading";
import { InputNumber, Select, DatePicker } from "components/Inputs";
import Tooltip from "components/Tooltip";
import Editor from "components/Editor";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";

import { Box, EditorBox } from "../Form.style";

export default function Base({ security }) {
  const { values, setFieldValue, errors } = useFormikContext();
  const {
    weight,
    height,
    observation,
    dialysis,
    gender,
    birthdate,
    skinColor,
    dischargeDate,
    lactating,
    pregnant,
  } = values;
  const layout = { label: 6, input: 16 };
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
          {errors.height && (
            <div
              style={{
                color: "#f5222d",
                paddingLeft: "12px",
                marginTop: "3px",
                fontSize: "13px",
              }}
            >
              Altura deve ser especificada em centímetros
            </div>
          )}
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
            allowClear
          >
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
            allowClear
          >
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
            allowClear
          >
            <Select.Option value="Amarela">Amarela</Select.Option>
            <Select.Option value="Branca">Branca</Select.Option>
            <Select.Option value="Índio">Índio</Select.Option>
            <Select.Option value="Negra">Negra</Select.Option>
            <Select.Option value="Parda">Parda</Select.Option>
          </Select>
        </Col>
      </Box>

      <Box hasError={errors.lactating}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">{t("labels.lactating")}:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            optionFilterProp="children"
            style={{
              marginLeft: 10,
              width: "100%",
            }}
            value={lactating}
            onChange={(value) => setFieldValue("lactating", value)}
          >
            <Select.Option value={true}>Sim</Select.Option>
            <Select.Option value={false}>Não</Select.Option>
          </Select>
        </Col>
      </Box>

      <Box hasError={errors.pregnant}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px" textAlign="right">
            <Tooltip title="">{t("labels.pregnant")}:</Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            optionFilterProp="children"
            style={{
              marginLeft: 10,
              width: "100%",
            }}
            value={pregnant}
            onChange={(value) => setFieldValue("pregnant", value)}
          >
            <Select.Option value={true}>Sim</Select.Option>
            <Select.Option value={false}>Não</Select.Option>
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
            value={birthdate ? dayjs(birthdate) : null}
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

      {PermissionService().has(Permission.ADMIN_PATIENT) && (
        <Box hasError={errors.dischargeDate}>
          <Col xs={layout.label}>
            <Heading as="label" size="14px" textAlign="right">
              <Tooltip title="">{t("labels.dischargeDate")}:</Tooltip>
            </Heading>
          </Col>
          <Col xs={layout.input}>
            <DatePicker
              format="DD/MM/YYYY HH:mm"
              value={dischargeDate ? dayjs(dischargeDate) : null}
              onChange={(value) =>
                setFieldValue(
                  "dischargeDate",
                  value ? value.format("YYYY-MM-DD HH:mm") : null
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
            <span
              style={{
                marginLeft: 10,
                fontSize: "10px",
              }}
            >
              *Campo editável somente para equipe NoHarm
            </span>
          </Col>
        </Box>
      )}

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
