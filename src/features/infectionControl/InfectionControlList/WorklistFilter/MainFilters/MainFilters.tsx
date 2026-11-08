import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
// the group of the same build as the styled Checkbox, or they share no context
import AntCheckbox from "antd/lib/checkbox";

import { useAppDispatch, useAppSelector } from "src/store";
import { Checkbox, Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { getSegmentDepartments } from "features/lists/ListsSlice";
import { getUniqBy } from "utils/report";
import { InfectionControlStatusEnum } from "models/InfectionControlEnum";

const STATUSES = [
  InfectionControlStatusEnum.PENDING,
  InfectionControlStatusEnum.REVISED,
  InfectionControlStatusEnum.CLOSED,
];

interface ISegmentDepartment {
  idDepartment: number;
  idSegment: number;
  label: string;
}

interface ISegment {
  id: number | string;
  description: string;
}

/** Status, segment and department, always in sight */
export function MainFilters() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;

  const departments = useAppSelector(
    (state: any) => state.lists.getSegmentDepartments,
  );
  // loaded at login
  const segments: ISegment[] = useAppSelector(
    (state: any) => state.segments.list ?? [],
  );

  // the departments of the chosen segments, all of them with none chosen
  const departmentsOf = (idSegment: number[]): ISegmentDepartment[] =>
    getUniqBy(
      (departments.list as ISegmentDepartment[]).filter(
        (d) => !idSegment.length || idSegment.includes(d.idSegment),
      ),
      "idDepartment",
    );

  // a department left out of the chosen segments is dropped from the filter
  const handleSegmentChange = (idSegment: number[]) => {
    const available = departmentsOf(idSegment).map((d) => d.idDepartment);
    setFieldValue({
      idSegment,
      idDepartment: (values.idDepartment ?? []).filter((id: number) =>
        available.includes(id),
      ),
    });
  };

  useEffect(() => {
    dispatch(getSegmentDepartments() as any);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Col xs={24} md={7}>
        <Heading {...({ as: "label", id: "status-label", $size: "14px" } as any)}>
          {t("infectionControl.worklist.status")}:
        </Heading>
        {/* every status in sight, a click away; none checked lists them all */}
        <div
          id="status"
          role="group"
          aria-labelledby="status-label"
          style={{ display: "flex", alignItems: "center", minHeight: 32 }}
        >
          <AntCheckbox.Group
            value={values.status ?? []}
            onChange={(status) => setFieldValue({ status })}
          >
            {STATUSES.map((value) => (
              <Checkbox key={value} value={value}>
                {t(`infectionControl.followUp.status.${value}`)}
              </Checkbox>
            ))}
          </AntCheckbox.Group>
        </div>
      </Col>
      <Col xs={24} md={6}>
        <Heading
          {...({ as: "label", htmlFor: "segments", $size: "14px" } as any)}
        >
          {t("infectionControl.worklist.filters.segment")}:
        </Heading>
        <Select
          id="segments"
          style={{ width: "100%" }}
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          optionFilterProp="children"
          placeholder={t(
            "infectionControl.worklist.filters.segmentPlaceholder",
          )}
          value={values.idSegment ?? []}
          onChange={(idSegment) => handleSegmentChange(idSegment as number[])}
        >
          {segments.map(({ id, description }) => (
            <Select.Option key={id} value={Number(id)}>
              {description}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col xs={24} md={6}>
        <Heading
          {...({ as: "label", htmlFor: "departments", $size: "14px" } as any)}
        >
          {t("screeningList.labelDepartment")}:
        </Heading>
        <Select
          id="departments"
          style={{ width: "100%" }}
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          optionFilterProp="children"
          autoClearSearchValue={false}
          placeholder={t("screeningList.labelDepartmentPlaceholder")}
          loading={departments.status === "loading"}
          value={values.idDepartment}
          onChange={(idDepartment: any) => setFieldValue({ idDepartment })}
        >
          {departmentsOf(values.idSegment ?? []).map(
            ({ idDepartment, idSegment, label }) => (
              <Select.Option
                key={`${idSegment}-${idDepartment}`}
                value={idDepartment}
              >
                {label}
              </Select.Option>
            ),
          )}
        </Select>
      </Col>
    </>
  );
}
