import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { getSubstances } from "features/lists/ListsSlice";

export default function MainFilters() {
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const dispatch = useDispatch();
  const substances = useSelector((state) => state.lists.getSubstances.list);
  const substancesStatus = useSelector(
    (state) => state.lists.getSubstances.status
  );

  useEffect(() => {
    dispatch(getSubstances({ useCache: true }));
  }, [dispatch]);

  return (
    <>
      <Col md={7} lg={14} xxl={8}>
        <Heading as="label" size="14px">
          Substância(s):
        </Heading>
        <Select
          id="idclass"
          optionFilterProp="children"
          showSearch
          style={{ width: "100%" }}
          value={values.idOriginList}
          onChange={(value, option) => setFieldValue({ idOriginList: value })}
          loading={substancesStatus === "loading"}
          mode="multiple"
          allowClear
        >
          {substances.map(({ sctid, name }) => (
            <Select.Option key={sctid} value={sctid}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </>
  );
}
