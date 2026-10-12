import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import { Select } from "components/Inputs";
import Heading from "components/Heading";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { getSegmentDepartments } from "features/lists/ListsSlice";
import { fetchSegmentsListThunk } from "store/ducks/segments/thunk";
import { getUniqBy } from "utils/report";
import { InfectionControlPendingTypeEnum } from "models/InfectionControlEnum";

const PENDING_TYPES = [
  InfectionControlPendingTypeEnum.NEVER_REVIEWED,
  InfectionControlPendingTypeEnum.NO_EVALUATION,
  InfectionControlPendingTypeEnum.EXPIRED,
  InfectionControlPendingTypeEnum.POSOLOGY_CHANGED,
  InfectionControlPendingTypeEnum.SCHEDULED_DATE,
  InfectionControlPendingTypeEnum.ALERT_FIRED,
];

interface ISegmentDepartment {
  idDepartment: number;
  idSegment: number;
  label: string;
}

/** The departments of the chosen segments (all of them when none is chosen) */
const filterDepartments = (
  idSegmentList: number[],
  list: ISegmentDepartment[],
): ISegmentDepartment[] =>
  getUniqBy(
    list.filter(
      (d) => !idSegmentList?.length || idSegmentList.includes(d.idSegment),
    ),
    "idDepartment",
  );

/** Segment, department and pending reason, always in sight */
export function MainFilters() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;

  const segments = useAppSelector((state: any) => state.segments);
  const departments = useAppSelector(
    (state: any) => state.lists.getSegmentDepartments,
  );

  useEffect(() => {
    dispatch(fetchSegmentsListThunk() as any);
    dispatch(getSegmentDepartments() as any);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Col xs={24} md={6}>
        <Heading
          {...({ as: "label", htmlFor: "segments", $size: "14px" } as any)}
        >
          {t("screeningList.segment")}:
        </Heading>
        <Select
          id="segments"
          style={{ width: "100%" }}
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          optionFilterProp="children"
          placeholder={t("infectionControl.worklist.filters.allSegments")}
          loading={segments.isFetching}
          value={values.idSegment}
          // the departments depend on the segments
          onChange={(idSegment: any) =>
            setFieldValue({ idSegment, idDepartment: [] })
          }
        >
          {segments.list.map(({ id, description }: any) => (
            <Select.Option key={id} value={id}>
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
          {filterDepartments(values.idSegment, departments.list).map(
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
      <Col xs={24} md={6}>
        <Heading
          {...({ as: "label", htmlFor: "pendingTypes", $size: "14px" } as any)}
        >
          {t("infectionControl.worklist.filters.pendingTypes")}:
        </Heading>
        <Select
          id="pendingTypes"
          style={{ width: "100%" }}
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          optionFilterProp="children"
          placeholder={t(
            "infectionControl.worklist.filters.pendingTypesPlaceholder",
          )}
          value={values.pendingTypes}
          onChange={(pendingTypes: any) => setFieldValue({ pendingTypes })}
        >
          {PENDING_TYPES.map((type) => (
            <Select.Option key={type} value={type}>
              {t(`infectionControl.worklist.pendingType.${type}`)}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </>
  );
}
