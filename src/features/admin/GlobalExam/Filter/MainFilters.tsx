import { useContext } from "react";
import { Col } from "antd";

import Heading from "components/Heading";
import { Input, Select } from "components/Inputs";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={2}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Situação:
        </Heading>

        <Select
          placeholder="Todos"
          value={values.active}
          onChange={(val) => setFieldValue({ active: val })}
          allowClear
          style={{ width: "90%" }}
        >
          <Select.Option value={true}>Ativo</Select.Option>
          <Select.Option value={false}>Inativo</Select.Option>
        </Select>
      </Col>

      <Col md={5}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Palavra-chave:
        </Heading>
        <Input
          placeholder="Nome ou tipo de exame..."
          value={values.term}
          onChange={({ target }) => setFieldValue({ term: target.value })}
        />
      </Col>
    </>
  );
}
