import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Input, Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { fetchSubstanceClasses } from "features/lists/ListsSlice";

export default function MainFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const dispatch = useDispatch();
  const substanceClasses = useSelector(
    (state) => state.lists.substanceClasses.list
  );
  const substanceClassesStatus = useSelector(
    (state) => state.lists.substanceClasses.status
  );

  useEffect(() => {
    if (substanceClasses.length === 0) {
      dispatch(fetchSubstanceClasses());
    }
  }, []); //eslint-disable-line

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
      <Col md={5} lg={5} xxl={5}>
        <Heading as="label" size="14px">
          Classe:
        </Heading>
        <Select
          id="idclass"
          optionFilterProp="children"
          showSearch
          style={{ width: "100%" }}
          value={values.idClassList}
          onChange={(value, option) => setFieldValue({ idClassList: value })}
          loading={substanceClassesStatus === "loading"}
          mode="multiple"
          maxTagCount="responsive"
        >
          {substanceClasses.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={3} lg={3} xxl={2}>
        <Heading as="label" size="14px">
          Manejo:
        </Heading>
        <Select
          id="idclass"
          optionFilterProp="children"
          showSearch
          style={{ width: "100%" }}
          value={values.hasHandling}
          onChange={(value, option) => setFieldValue({ hasHandling: value })}
          allowClear
        >
          <Select.Option value={1}>Sim</Select.Option>
          <Select.Option value={0}>Não</Select.Option>
        </Select>
      </Col>
    </>
  );
}
