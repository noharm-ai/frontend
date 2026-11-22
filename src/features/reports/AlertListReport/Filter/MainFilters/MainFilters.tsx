import { useContext } from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "src/store";
import { Select, SelectCustom } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";
import DrugAlertLevelTag from "components/DrugAlertLevelTag";
import type { AlertListFilters } from "../../transformers";

// what components/AdvancedFilter (still JS) hands its filters through context
interface FilterContextValue {
  values: AlertListFilters;
  setFieldValue: (values: Partial<AlertListFilters>) => void;
}

interface AlertTypeOption {
  id: string;
  label: string;
}

export function MainFilters() {
  const { t } = useTranslation();
  const drugs = useAppSelector(
    (state) => state.reportsArea.alertList.filterData.drugs,
  );

  const status = useAppSelector((state) => state.reportsArea.alertList.status);
  const { values, setFieldValue } = useContext(
    AdvancedFilterContext,
  ) as FilterContextValue;

  return (
    <>
      <Col md={5} lg={3} xxl={3}>
        <Heading as="label" $size="14px">
          Nível:
        </Heading>
        <Select
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.levelList}
          onChange={(val) => setFieldValue({ levelList: val as string[] })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          <Select.Option key={"low"} value={"low"}>
            <DrugAlertLevelTag
              levels={["low"]}
              count={undefined}
              showDescription
            />
          </Select.Option>
          <Select.Option key={"medium"} value={"medium"}>
            <DrugAlertLevelTag
              levels={["medium"]}
              count={undefined}
              showDescription
            />
          </Select.Option>
          <Select.Option key={"high"} value={"high"}>
            <DrugAlertLevelTag
              levels={["high"]}
              count={undefined}
              showDescription
            />
          </Select.Option>
        </Select>
      </Col>
      <Col md={7} lg={6} xxl={6}>
        <Heading as="label" $size="14px">
          Medicamento:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.drugList}
          onChange={(val: string[]) => setFieldValue({ drugList: val })}
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
        </SelectCustom>
      </Col>

      <Col md={7} lg={6} xxl={6}>
        <Heading as="label" $size="14px">
          Tipo:
        </Heading>
        <SelectCustom
          style={{ width: "100%", maxWidth: "400px" }}
          value={values.typeList}
          onChange={(val: string[]) => setFieldValue({ typeList: val })}
          showSearch
          optionFilterProp="children"
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          loading={status === "loading"}
          autoClearSearchValue={false}
        >
          {(DrugAlertTypeEnum.getAlertTypes(t) as AlertTypeOption[]).map(
            (a) => (
              <Select.Option key={a.id} value={a.id}>
                {a.label}
              </Select.Option>
            ),
          )}
        </SelectCustom>
      </Col>
    </>
  );
}
