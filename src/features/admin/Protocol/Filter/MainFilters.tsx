import { useContext } from "react";
import { Segmented } from "antd";

import { Input, Select } from "components/Inputs";
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
      <Col md={7} lg={6} xxl={5}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Nome:
        </Heading>
        <Input
          style={{ width: "100%" }}
          value={values.term}
          onChange={({ target }: any) => setFieldValue({ term: target.value })}
          allowClear
          placeholder="Pesquisar pelo nome"
        />
      </Col>
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
      <Col md={7} lg={6} xxl={5}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Origem:
        </Heading>
        <div>
          <Segmented
            value={values.allSchemas ? "all" : "current"}
            onChange={(value) => setFieldValue({ allSchemas: value === "all" })}
            options={[
              { label: "Schema atual", value: "current" },
              // other schemas are read-only here: they can only be copied
              { label: "Todos os schemas", value: "all" },
            ]}
          />
        </div>
      </Col>
    </>
  );
}
