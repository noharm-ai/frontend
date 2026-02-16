import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { Col } from "components/Grid";
import { SelectCustom, RangeDatePicker, Select } from "components/Inputs";
import Heading from "components/Heading";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Creators as SegmentsCreators } from "store/ducks/segments";

export default function MainFilters() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;

  const segments = useSelector((state: any) => state.segments.list);
  const segmentsFetching = useSelector(
    (state: any) => state.segments.isFetching,
  );

  useEffect(() => {
    if (segments.length === 0) {
      dispatch(SegmentsCreators.segmentsFetchListStart());
    }
  }, [dispatch, segments.length]);

  const handleChange = (key: string, value: any) => {
    setFieldValue({ [key]: value });
  };

  const handleSegmentChange = (val: string[]) => {
    setFieldValue({ segment: val, id_department: [] });
  };

  const getDepartments = () => {
    if (!segments) return [];

    // Flatten departments from all segments or filtered segments
    let departments: any[] = [];

    if (values.segment && values.segment.length > 0) {
      const selectedSegments = segments.filter((s: any) =>
        values.segment.includes(s.description),
      );
      selectedSegments.forEach((s: any) => {
        if (s.departments) {
          departments = [...departments, ...s.departments];
        }
      });
    } else {
      segments.forEach((s: any) => {
        if (s.departments) {
          departments = [...departments, ...s.departments];
        }
      });
    }

    // dedup by id
    return [
      ...new Map(departments.map((item) => [item.id, item])).values(),
    ].sort((a, b) => a.description.localeCompare(b.description));
  };

  const getSegmentsList = () => {
    return segments.map((s: any) => s.description).sort();
  };

  return (
    <>
      <Col md={6}>
        {/* @ts-expect-error missing types */}
        <Heading as="label" $size="14px">
          {t("tableHeader.period")}:
        </Heading>
        <RangeDatePicker
          format="DD/MM/YYYY"
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
          loading={segmentsFetching}
          optionFilterProp="children"
          allowClear
        >
          {getDepartments().map((d: any) => (
            <Select.Option key={d.id} value={d.id}>
              {d.description}
            </Select.Option>
          ))}
        </SelectCustom>
      </Col>
    </>
  );
}
