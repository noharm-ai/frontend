import React, { useContext } from "react";
import { useSelector } from "react-redux";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select, SelectCustom, Radio } from "components/Inputs";

export default function SecondaryFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const responsibles = useSelector(
    (state) => state.reportsArea.economy.responsibles
  );

  const originDrugs = useSelector(
    (state) => state.reportsArea.economy.originDrugs
  );
  const destinyDrugs = useSelector(
    (state) => state.reportsArea.economy.destinyDrugs
  );
  const reasons = useSelector((state) => state.reportsArea.economy.reasons);
  const insurances = useSelector(
    (state) => state.reportsArea.economy.insurances
  );
  const status = useSelector((state) => state.reportsArea.economy.status);

  const economyTypes = [
    { label: "Suspensão", value: 1 },
    { label: "Substituição", value: 2 },
    { label: "Customizada", value: 3 },
    { label: "Todos", value: "" },
  ];

  const economyValueTypes = [
    { label: "Negativo", value: "n" },
    { label: "Positivo", value: "p" },
    { label: "Todos", value: "" },
  ];

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Tipo economia:
        </Heading>
        <Radio.Group
          style={{ marginTop: "5px" }}
          options={economyTypes}
          onChange={({ target: { value } }) =>
            setFieldValue({ economyType: value })
          }
          value={values.economyType}
          optionType="button"
        />
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Valor Economia/Dia:
        </Heading>
        <Radio.Group
          style={{ marginTop: "5px" }}
          options={economyValueTypes}
          onChange={({ target: { value } }) =>
            setFieldValue({ economyValueType: value })
          }
          value={values.economyValueType}
          optionType="button"
        />
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Responsável:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.responsibleList}
          onChange={(val) => setFieldValue({ responsibleList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
          onSelectAll={() =>
            setFieldValue({
              responsibleList: responsibles,
            })
          }
        >
          {responsibles.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>

      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Medicamento origem:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.originDrugList}
          onChange={(val) => setFieldValue({ originDrugList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
          onSelectAll={() =>
            setFieldValue({
              originDrugList: originDrugs,
            })
          }
        >
          {originDrugs.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Medicamento substituto:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.destinyDrugList}
          onChange={(val) => setFieldValue({ destinyDrugList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
          onSelectAll={() =>
            setFieldValue({
              destinyDrugList: destinyDrugs,
            })
          }
        >
          {destinyDrugs.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Motivo:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.reasonList}
          onChange={(val) => setFieldValue({ reasonList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
          onSelectAll={() =>
            setFieldValue({
              reasonList: reasons,
            })
          }
        >
          {reasons.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Desfecho:
        </Heading>
        <Select
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.statusList}
          onChange={(val) => setFieldValue({ statusList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          <Select.Option key={"a"} value={"a"}>
            Aceita
          </Select.Option>
          <Select.Option key={"j"} value={"j"}>
            Justificada
          </Select.Option>
          <Select.Option key={"n"} value={"n"}>
            Não Aceita
          </Select.Option>
          <Select.Option key={"x"} value={"x"}>
            Não se Aplica
          </Select.Option>
        </Select>
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Convênio:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.insuranceList}
          onChange={(val) => setFieldValue({ insuranceList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
          onSelectAll={() =>
            setFieldValue({
              insuranceList: insurances,
            })
          }
        >
          {insurances.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </Row>
  );
}
