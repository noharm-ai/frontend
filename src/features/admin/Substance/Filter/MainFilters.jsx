import React, { useContext } from "react";

import { Input, Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={5} lg={5} xxl={5}>
        <Heading as="label" size="14px">
          Nome:
        </Heading>
        <Input
          value={values.name}
          onChange={({ target }) =>
            setFieldValue({ name: target.value !== "" ? target.value : null })
          }
        />
        <div style={{ marginTop: "4px", fontSize: "12px" }}>
          *Utilize o caractere % para procurar por partes de uma palavra. Ex:
          %Morfina%
        </div>
      </Col>
      <Col md={3} lg={3} xxl={3}>
        <Heading as="label" size="14px">
          ID Classe:
        </Heading>
        <Input
          value={values.className}
          onChange={({ target }) =>
            setFieldValue({
              className: target.value !== "" ? target.value : null,
            })
          }
        />
      </Col>

      <Col md={3} lg={3} xxl={2}>
        <Heading as="label" size="14px">
          Possui Classe:
        </Heading>
        <Select
          id="idclass"
          optionFilterProp="children"
          showSearch
          style={{ width: "100%" }}
          value={values.hasClass}
          onChange={(value, option) => setFieldValue({ hasClass: value })}
          allowClear
        >
          <Select.Option value={1}>Sim</Select.Option>
          <Select.Option value={0}>Não</Select.Option>
        </Select>
      </Col>
    </>
  );
}
