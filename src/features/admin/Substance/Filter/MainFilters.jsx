import React, { useContext } from "react";

import { Input } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={5} lg={4} xxl={5}>
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
    </>
  );
}
