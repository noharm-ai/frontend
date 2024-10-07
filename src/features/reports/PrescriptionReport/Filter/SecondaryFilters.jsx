import React, { useContext } from "react";
import { useSelector } from "react-redux";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import {
  Select,
  Radio,
  InputNumber,
  DatePicker,
  SelectCustom,
} from "components/Inputs";

export default function SecondaryFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const responsibles = useSelector(
    (state) => state.reportsArea.prescription.responsibles
  );
  const status = useSelector((state) => state.reportsArea.prescription.status);

  const yesNoOptions = [
    { label: "Sim", value: true },
    { label: "Não", value: false },
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
          Feriados/Dias de folga:
        </Heading>
        <DatePicker
          multiple
          maxTagCount="responsive"
          format="DD/MM/YYYY"
          onChange={(dates) => setFieldValue({ daysOffList: dates })}
          value={values.daysOffList}
        />
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Contabilizar prescrições que possuam somente Dietas/Recomendações:
        </Heading>
        <Radio.Group
          style={{ marginTop: "5px" }}
          options={yesNoOptions}
          onChange={({ target: { value } }) =>
            setFieldValue({ showDiets: value })
          }
          value={values.showDiets}
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
          Escore mínimo:
        </Heading>
        <InputNumber
          style={{
            width: 120,
          }}
          min={0}
          max={99999}
          value={values.minScore}
          onChange={(value) => setFieldValue({ minScore: value })}
        />
      </Col>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" size="14px">
          Escore máximo:
        </Heading>
        <InputNumber
          style={{
            width: 120,
          }}
          min={0}
          max={99999}
          value={values.maxScore}
          onChange={(value) => setFieldValue({ maxScore: value })}
        />
      </Col>
    </Row>
  );
}
