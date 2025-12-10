import { useContext } from "react";

import { Select, Radio } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { RegulationReportIndicatorEnum } from "src/models/regulation/RegulationReportIndicatorEnum";

export default function MainFilters() {
  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);

  const indicatorOptions = RegulationReportIndicatorEnum.getList();

  const hasIndicatorOptions = [
    { label: "Concluído", value: true },
    { label: "Pendente", value: false },
    { label: "Ambos", value: null },
  ];

  return (
    <>
      <Col md={7} lg={8} xxl={7}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" htmlFor="date" $size="14px">
          Indicador
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.indicator}
          onChange={(val) => setFieldValue({ indicator: val })}
          showSearch
          optionFilterProp="children"
          allowClear
          options={indicatorOptions}
        />
      </Col>
      <Col md={7} lg={6} xxl={5}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" htmlFor="date" $size="14px">
          Situação
        </Heading>
        <Radio.Group
          options={hasIndicatorOptions}
          optionType="button"
          onChange={({ target: { value } }: any) =>
            setFieldValue({ has_indicator: value })
          }
          value={values.has_indicator}
        />
      </Col>
    </>
  );
}
