import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import { Select } from "components/Inputs";
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

/** Status, segment, department and admissions, always in sight */
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
      <Col xs={24} md={5}>
        <Heading
          {...({ as: "label", htmlFor: "status", $size: "14px" } as any)}
        >
          {t("infectionControl.worklist.status")}:
        </Heading>
        <Select
          id="status"
          style={{ width: "100%" }}
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          placeholder={t("infectionControl.worklist.filters.allStatuses")}
          value={values.status}
          onChange={(status: any) => setFieldValue({ status })}
        >
          {STATUSES.map((value) => (
            <Select.Option key={value} value={value}>
              {t(`infectionControl.followUp.status.${value}`)}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col xs={24} md={5}>
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
      <Col xs={24} md={4}>
        <Heading
          {...({
            as: "label",
            htmlFor: "admissionNumbers",
            $size: "14px",
          } as any)}
        >
          {t("infectionControl.worklist.filters.admissionNumbers")}:
        </Heading>
        <Select
          id="admissionNumbers"
          style={{ width: "100%" }}
          mode="tags"
          allowClear
          maxTagCount="responsive"
          tokenSeparators={[",", " "]}
          placeholder={t(
            "infectionControl.worklist.filters.admissionNumbersPlaceholder",
          )}
          notFoundContent={t(
            "infectionControl.worklist.filters.admissionNumbersPlaceholder",
          )}
          value={(values.admissionNumbers ?? []).map(String)}
          onChange={(list: any) =>
            setFieldValue({
              admissionNumbers: list
                .filter((value: string) => /^\d+$/.test(value))
                .map(Number),
            })
          }
        />
      </Col>
    </>
  );
}
