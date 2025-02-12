import React, { useContext } from "react";
import { useSelector } from "react-redux";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select, Radio, SelectCustom } from "components/Inputs";

export default function SecondaryFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const responsibles = useSelector(
    (state) => state.reportsArea.prescriptionAudit.responsibles
  );
  const tags = useSelector((state) => state.reportsArea.prescriptionAudit.tags);
  const status = useSelector(
    (state) => state.reportsArea.prescriptionAudit.status
  );

  const yesNoOptions = [
    { label: "Sim", value: true },
    { label: "Não", value: false },
  ];

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" $size="14px">
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
        <Heading as="label" $size="14px">
          Tipo:
        </Heading>
        <Radio.Group
          style={{ marginTop: "5px" }}
          options={[
            { label: "Paciente", value: "patient" },
            { label: "Prescrição", value: "prescription" },
            { label: "Todos", value: "" },
          ]}
          onChange={({ target: { value } }) => setFieldValue({ type: value })}
          value={values.type}
          optionType="button"
        />
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" $size="14px">
          Ação:
        </Heading>
        <Radio.Group
          style={{ marginTop: "5px" }}
          options={[
            { label: "Checar", value: "check" },
            { label: "Deschecar", value: "uncheck" },
            { label: "Todos", value: "" },
          ]}
          onChange={({ target: { value } }) =>
            setFieldValue({ eventType: value })
          }
          value={values.eventType}
          optionType="button"
        />
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" $size="14px">
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
        <Heading as="label" $size="14px">
          Marcadores:
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
