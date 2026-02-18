import { useContext } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import { Col } from "components/Grid";
import { SelectCustom, RangeDatePicker, Select } from "components/Inputs";
import Heading from "components/Heading";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { getSegmentDepartments } from "features/lists/ListsSlice";
import { getUniqBy } from "utils/report";
import { getLongDateRangePresets } from "utils/report";

export default function MainFilters() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;

  const segments = useAppSelector((state: any) => state.segments.list);
  const segmentsFetching = useAppSelector(
    (state: any) => state.segments.isFetching,
  );
  const departments = useAppSelector(
    (state) => state.lists.getSegmentDepartments.list,
  );

  const departmentsStatus = useAppSelector(
    (state) => state.lists.getSegmentDepartments.status,
  );

  const handleChange = (key: string, value: any) => {
    setFieldValue({ [key]: value });
  };

  const handleSegmentChange = (val: string[]) => {
    setFieldValue({ segment: val, id_department: [] });
  };

  const getSegmentsList = () => {
    return segments.map((s: any) => s.description).sort();
  };

  const filterDepartments = (list: any[]) => {
    const idSegmentList = values.segment.map((seg_description: string) => {
      const segment = segments.find(
        (s: any) => s.description === seg_description,
      );
      return segment?.id;
    });

    const deps = list.filter((d) => {
      if (!idSegmentList || idSegmentList.length === 0) {
        return true;
      }

      return idSegmentList.indexOf(d.idSegment) !== -1;
    });

    return getUniqBy(deps, "idDepartment");
  };

  return (
    <>
      <Col md={5}>
        {/* @ts-expect-error missing types */}
        <Heading as="label" $size="14px">
          {t("tableHeader.period")}:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          presets={getLongDateRangePresets(values.reportDate)}
          value={values.dateRange}
          onChange={(val: any) => {
            handleChange("dateRange", val);
          }}
          allowClear={false}
          style={{ width: "100%" }}
        />
      </Col>
      <Col md={6}>
        {/* @ts-expect-error missing types */}
        <Heading as="label" $size="14px">
          Segmento:
        </Heading>
        <SelectCustom
          style={{ width: "100%" }}
          value={values.segment}
          onChange={handleSegmentChange}
          showSearch
          mode="multiple"
          maxTagCount="responsive"
          loading={segmentsFetching}
          optionFilterProp="children"
          allowClear
        >
          {getSegmentsList().map((s: string) => (
            <Select.Option key={s} value={s}>
              {s}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={6}>
        {/* @ts-expect-error missing types */}
        <Heading as="label" $size="14px">
          Setor:
        </Heading>
        <SelectCustom
          style={{ width: "100%" }}
          value={values.id_department}
          onChange={(val: any) => handleChange("id_department", val)}
          showSearch
          mode="multiple"
          maxTagCount="responsive"
          loading={departmentsStatus === "loading"}
          optionFilterProp="children"
          allowClear
          onDropdownVisibleChange={(open: boolean) => {
            if (open && departments.length === 0) {
              dispatch(getSegmentDepartments());
            }
          }}
        >
          {filterDepartments(departments).map((d: any) => (
            <Select.Option key={d.idDepartment} value={d.idDepartment}>
              {d.label}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </>
  );
}
