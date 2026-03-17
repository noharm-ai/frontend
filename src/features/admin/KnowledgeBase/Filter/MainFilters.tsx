import { useContext } from "react";

import { Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { KnowledgeBasePathEnum } from "models/KnowledgeBasePathEnum";

export default function MainFilters() {
  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);

  const activeOptions = [
    {
      value: true,
      label: "Ativo",
    },
    {
      value: false,
      label: "Inativo",
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
          value={values.active}
          onChange={(val) => setFieldValue({ active: val })}
          showSearch
          optionFilterProp="children"
          allowClear
          options={activeOptions}
        ></Select>
      </Col>
      <Col md={5} lg={4} xxl={5}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Página relacionada:
        </Heading>
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          value={values.path}
          onChange={(val) => setFieldValue({ path: val })}
          showSearch
          optionFilterProp="label"
          allowClear
          options={KnowledgeBasePathEnum.getList()}
        />
      </Col>
    </>
  );
}
