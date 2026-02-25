import { useContext } from "react";
import { useSelector } from "react-redux";

import { Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";

export default function MainFilters() {
  const createdBy = useSelector(
    (state: any) => state.reportsArea.checkedIndex.filterData.createdBy,
  );
  const status = useSelector(
    (state: any) => state.reportsArea.checkedIndex.status,
  );
  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={7} lg={5} xxl={5}>
        {/* @ts-expect-error legacy code */}
        <Heading as="label" $size="14px">
          Checado por:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "700px" }}
          value={values?.createdByList}
          onChange={(val: any) => setFieldValue({ createdByList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {createdBy.map((i: string) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </>
  );
}
