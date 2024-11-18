import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { Select, RangeDatePicker } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { i18n } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  const onChangeDates = (value) => {
    const startDate = value[0] ? dayjs(value[0]).format("YYYY-MM-DD") : null;
    const endDate = value[1] ? dayjs(value[1]).format("YYYY-MM-DD") : null;
    setFieldValue({
      startDate,
      endDate,
    });
  };

  return (
    <>
      <Col md={7} lg={6} xxl={4}>
        <Heading as="label" htmlFor="date" size="14px">
          Data da solicitação
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          value={[
            values.startDate ? dayjs(values.startDate) : null,
            values.endDate ? dayjs(values.endDate) : null,
          ]}
          onChange={onChangeDates}
          style={{ width: "100%" }}
          popupClassName="noArrow"
          allowClear={false}
          language={i18n.language}
        />
      </Col>
      <Col md={5} lg={4} xxl={4}>
        <Heading as="label" size="14px">
          Tipo:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.typeList}
          onChange={(val) => setFieldValue({ typeList: val })}
          showSearch
          optionFilterProp="children"
          allowClear
          mode="multiple"
          maxTagCount="responsive"
        >
          <Select.Option key={0} value={true}>
            Teste1
          </Select.Option>
          <Select.Option key={1} value={false}>
            Teste2
          </Select.Option>
        </Select>
      </Col>
      <Col md={5} lg={4} xxl={4}>
        <Heading as="label" size="14px">
          Etapa:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.stageList}
          onChange={(val) => setFieldValue({ stageList: val })}
          showSearch
          optionFilterProp="children"
          allowClear
          mode="multiple"
          maxTagCount="responsive"
        >
          <Select.Option key={0} value={true}>
            Não iniciado
          </Select.Option>
          <Select.Option key={1} value={false}>
            Aguardando agendamento
          </Select.Option>
        </Select>
      </Col>
    </>
  );
}
