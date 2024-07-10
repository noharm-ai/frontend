import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";
import DrugAlertLevelTag from "components/DrugAlertLevelTag";

export default function MainFilters() {
  const { t } = useTranslation();
  const drugs = useSelector(
    (state) => state.reportsArea.alertList.filterData.drugs
  );

  const status = useSelector((state) => state.reportsArea.alertList.status);
  const { values, setFieldValue } = useContext(AdvancedFilterContext);

  return (
    <>
      <Col md={5} lg={3} xxl={3}>
        <Heading as="label" size="14px">
          Nível:
        </Heading>
        <Select
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.levelList}
          onChange={(val) => setFieldValue({ levelList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          <Select.Option key={"low"} value={"low"}>
            <DrugAlertLevelTag levels={["low"]} showDescription />
          </Select.Option>
          <Select.Option key={"medium"} value={"medium"}>
            <DrugAlertLevelTag levels={["medium"]} showDescription />
          </Select.Option>
          <Select.Option key={"high"} value={"high"}>
            <DrugAlertLevelTag levels={["high"]} showDescription />
          </Select.Option>
        </Select>
      </Col>
      <Col md={7} lg={6} xxl={6}>
        <Heading as="label" size="14px">
          Medicamento:
        </Heading>
        <Select
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.drugList}
          onChange={(val) => setFieldValue({ drugList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {drugs.map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </Select>
      </Col>

      <Col md={7} lg={6} xxl={6}>
        <Heading as="label" size="14px">
          Tipo:
        </Heading>
        <Select
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.typeList}
          onChange={(val) => setFieldValue({ typeList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {DrugAlertTypeEnum.getAlertTypes(t).map((a) => (
            <Select.Option key={a.id} value={a.id}>
              {a.label}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </>
  );
}
