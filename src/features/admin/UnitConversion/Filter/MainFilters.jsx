import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Select, InputNumber } from "components/Inputs";
import Tag from "components/Tag";
import Heading from "components/Heading";
import Tooltip from "components/Tooltip";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { SubstanceTagEnum } from "src/models/SubstanceTagEnum";

export default function MainFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const { t } = useTranslation();

  return (
    <>
      <Col md={4} lg={3} xxl={2}>
        <Heading as="label" $size="14px">
          Inferência:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.showPrediction}
          onChange={(val) => setFieldValue({ showPrediction: val })}
        >
          <Select.Option key={1} value={true}>
            <Tag color="green">Habilitar</Tag>
          </Select.Option>
          <Select.Option key={0} value={false}>
            <Tag color="red">Desabilitar</Tag>
          </Select.Option>
        </Select>
      </Col>
      <Col md={5} lg={4} xxl={3}>
        <Heading as="label" $size="14px">
          Fator de Conversão:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.conversionType}
          onChange={(val) => setFieldValue({ conversionType: val })}
          showSearch
          optionFilterProp="children"
          allowClear
        >
          <Select.Option key={0} value={"filled"}>
            <Tag color="green">Preenchido</Tag>
          </Select.Option>
          <Select.Option key={1} value={"empty"}>
            <Tag color="red">Vazio</Tag>
          </Select.Option>
          <Select.Option key={2} value={"mismatch"}>
            <Tag color="red">Mismatch (inferência)</Tag>
          </Select.Option>
        </Select>
      </Col>
      <Col md={5} lg={3} xxl={2}>
        <Heading as="label" $size="14px">
          <Tooltip title="Quantidade mínima que o medicamento foi prescrito">
            Contagem mín.:
          </Tooltip>
        </Heading>
        <InputNumber
          value={values.minDrugCount}
          min={0}
          style={{ width: "100%" }}
          onChange={(val) => setFieldValue({ minDrugCount: val })}
        />
      </Col>
      <Col md={7} lg={4} xxl={4}>
        <Heading as="label" $size="14px">
          Remover por Tag:
        </Heading>
        <Select
          optionFilterProp="children"
          showSearch
          value={values.tags}
          onChange={(value) => setFieldValue({ tags: value })}
          allowClear
          mode="multiple"
          style={{ width: "100%" }}
        >
          {SubstanceTagEnum.getSubstanceTags(t).map((subtag) => (
            <Select.Option key={subtag.id} value={subtag.id}>
              {subtag.label}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </>
  );
}
