import React, { useContext } from "react";
import { useSelector } from "react-redux";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select, Radio, SelectCustom } from "components/Inputs";

export default function SecondaryFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const responsibles = useSelector(
    (state) => state.reportsArea.intervention.responsibles
  );
  const prescribers = useSelector(
    (state) => state.reportsArea.intervention.prescribers
  );
  const drugs = useSelector((state) => state.reportsArea.intervention.drugs);
  const reasons = useSelector(
    (state) => state.reportsArea.intervention.reasons
  );
  const tags = useSelector((state) => state.reportsArea.intervention.tags);
  const status = useSelector((state) => state.reportsArea.intervention.status);

  const yesNoOptions = [
    { label: "Sim", value: true },
    { label: "Não", value: false },
  ];

  const yesNoAllOptions = [
    { label: "Sim", value: true },
    { label: "Não", value: false },
    { label: "Todos", value: "" },
  ];

  const interventionTypes = [
    { label: "No Paciente", value: "p" },
    { label: "No Medicamento", value: "d" },
    { label: "Todos", value: "" },
  ];

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Somente dias de semana:
        </Heading>
        <Radio.Group
          style={{ marginTop: "5px" }}
          options={yesNoOptions}
          onChange={({ target: { value } }) =>
            setFieldValue({ weekDays: value })
          }
          value={values.weekDays}
          optionType="button"
        />
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Tipo de intervenção:
        </Heading>
        <Radio.Group
          style={{ marginTop: "5px" }}
          options={interventionTypes}
          onChange={({ target: { value } }) =>
            setFieldValue({ interventionType: value })
          }
          value={values.interventionType}
          optionType="button"
        />
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Gera redução de custo?
        </Heading>
        <Radio.Group
          style={{ marginTop: "5px" }}
          options={yesNoAllOptions}
          onChange={({ target: { value } }) => setFieldValue({ cost: value })}
          value={values.cost}
          optionType="button"
        />
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Possível erro de prescrição?
        </Heading>
        <Radio.Group
          style={{ marginTop: "5px" }}
          options={yesNoAllOptions}
          onChange={({ target: { value } }) =>
            setFieldValue({ prescriptionError: value })
          }
          value={values.prescriptionError}
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
          Prescritor:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.prescriberList}
          onChange={(val) => setFieldValue({ prescriberList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
          onSelectAll={() =>
            setFieldValue({
              prescriberList: prescribers,
            })
          }
        >
          {prescribers.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Medicamento:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.drugList}
          onChange={(val) => setFieldValue({ drugList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
          onSelectAll={() =>
            setFieldValue({
              drugList: drugs,
            })
          }
        >
          {drugs.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Atributo do medicamento:
        </Heading>
        <Select
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.drugAttrList}
          onChange={(val) => setFieldValue({ drugAttrList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          <Select.Option key={"attrAntimicro"} value={"attrAntimicro"}>
            Antimicrobiano
          </Select.Option>
          <Select.Option key={"attrMav"} value={"attrMav"}>
            Alta Vigilância
          </Select.Option>
          <Select.Option key={"attrControl"} value={"attrControl"}>
            Controlado
          </Select.Option>
          <Select.Option key={"attrNotStandard"} value={"attrNotStandard"}>
            Não Padronizado
          </Select.Option>
          <Select.Option key={"attrQuimio"} value={"attrQuimio"}>
            Quimioterápico
          </Select.Option>
        </Select>
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
          <Select.Option key={"s"} value={"s"}>
            Pendente
          </Select.Option>
        </Select>
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Marcadores do paciente:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.tagList}
          onChange={(val) => setFieldValue({ tagList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
          onSelectAll={() =>
            setFieldValue({
              tagList: tags,
            })
          }
        >
          {tags.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </Row>
  );
}
