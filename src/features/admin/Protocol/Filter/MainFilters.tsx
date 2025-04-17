import { useContext } from "react";

import { Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);

  const statusOptions = [
    {
      value: 0,
      label: "Inativo",
    },
    {
      value: 1,
      label: "Ativo",
    },
    {
      value: 2,
      label: "Homologação",
    },
  ];

  return (
    <>
      <Col md={5} lg={4} xxl={3}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Situação:
        </Heading>
        <Select
          style={{ width: "100%" }}
          value={values.statusType}
          onChange={(val) => setFieldValue({ statusType: val })}
          showSearch
          optionFilterProp="children"
          allowClear
          options={statusOptions}
        ></Select>
      </Col>
    </>
  );
}
