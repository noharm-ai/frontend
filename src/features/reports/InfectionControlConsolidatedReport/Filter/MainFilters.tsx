import { useContext } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import { Col } from "components/Grid";
import { SelectCustom, RangeDatePicker, Select } from "components/Inputs";
import Heading from "components/Heading";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { getSegmentDepartments } from "features/lists/ListsSlice";
import { getUniqBy, getLongDateRangePresets } from "utils/report";

import { IFilterContext } from "../infectionControlReportTypes";

interface ISegment {
  id: number;
  description: string;
}

interface ISegmentDepartment {
  idSegment: number;
  idDepartment: number;
  label: string;
}

/** Period, segment and department (by id: the report files keep the department id). */
export function MainFilters() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { values, setFieldValue } = useContext(
    AdvancedFilterContext,
  ) as IFilterContext;
  const tk = (key: string) => t(`infectionControlConsolidated.filter.${key}`);

  // the segments duck (reduxsauce) is persisted untyped
  const segments: ISegment[] = useAppSelector(
    (state: any) => state.segments.list,
  );
  const segmentsFetching: boolean = useAppSelector(
    (state: any) => state.segments.isFetching,
  );
  const departments: ISegmentDepartment[] = useAppSelector(
    (state) => state.lists.getSegmentDepartments.list,
  );
  const departmentsStatus = useAppSelector(
    (state) => state.lists.getSegmentDepartments.status,
  );

  const handleSegmentChange = (val: string[]) => {
    setFieldValue({ segment: val, department: [] });
  };

  const segmentNames = segments.map((s) => s.description).sort();

  const filterDepartments = (
    list: ISegmentDepartment[],
  ): ISegmentDepartment[] => {
    const idSegmentList = values.segment.map(
      (description) => segments.find((s) => s.description === description)?.id,
    );

    const deps = list.filter(
      (d) =>
        idSegmentList.length === 0 || idSegmentList.indexOf(d.idSegment) !== -1,
    );

    return getUniqBy(deps, "idDepartment");
  };

  return (
    <>
      <Col md={5}>
        {/* @ts-expect-error missing types */}
        <Heading as="label" $size="14px">
          {tk("period")}:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
          presets={getLongDateRangePresets()}
          value={values.dateRange}
          onChange={(val: IFilterContext["values"]["dateRange"]) =>
            setFieldValue({ dateRange: val })
          }
          allowClear={false}
          style={{ width: "100%" }}
        />
      </Col>
      <Col md={6}>
        {/* @ts-expect-error missing types */}
        <Heading as="label" $size="14px">
          {tk("segment")}:
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
          {segmentNames.map((s: string) => (
            <Select.Option key={s} value={s}>
              {s}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
      <Col md={6}>
        {/* @ts-expect-error missing types */}
        <Heading as="label" $size="14px">
          {tk("department")}:
        </Heading>
        <SelectCustom
          id="infection-control-department"
          style={{ width: "100%" }}
          value={values.department}
          onChange={(val: number[]) => setFieldValue({ department: val })}
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
          {filterDepartments(departments).map((d) => (
            <Select.Option key={d.idDepartment} value={d.idDepartment}>
              {d.label}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </>
  );
}
