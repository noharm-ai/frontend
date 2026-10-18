import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import { InputNumber, Select } from "components/Inputs";
import Heading from "components/Heading";
import Tooltip from "components/Tooltip";
import { Col } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { getSegmentDepartments } from "features/lists/ListsSlice";
import { getUniqBy } from "utils/report";
import {
  InfectionControlPendingTypeEnum,
  InfectionControlStatusEnum,
} from "models/InfectionControlEnum";

import { AntimicrobialFilter } from "../AntimicrobialFilter/AntimicrobialFilter";
import { DayRange } from "./MainFilters.style";

const STATUSES = [
  InfectionControlStatusEnum.PENDING,
  InfectionControlStatusEnum.REVISED,
  InfectionControlStatusEnum.CLOSED,
];

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

/**
 * Status, department, pending reason, antimicrobial and treatment day, always
 * in sight: the antimicrobial and the day are searched together
 */
export function MainFilters() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;

  const departments = useAppSelector(
    (state: any) => state.lists.getSegmentDepartments,
  );

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
          {(
            getUniqBy(departments.list, "idDepartment") as ISegmentDepartment[]
          ).map(({ idDepartment, idSegment, label }) => (
            <Select.Option
              key={`${idSegment}-${idDepartment}`}
              value={idDepartment}
            >
              {label}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col xs={24} md={5}>
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
      <Col xs={24} md={5}>
        <Heading {...({ as: "label", htmlFor: "drugs", $size: "14px" } as any)}>
          {t("infectionControl.worklist.filters.drugs")}:
        </Heading>
        <AntimicrobialFilter
          id="drugs"
          value={values.drugs ?? []}
          onChange={(drugs) => setFieldValue({ drugs })}
        />
      </Col>
      <Col xs={24} md={4}>
        <Heading
          {...({
            as: "label",
            htmlFor: "treatmentDayFrom",
            $size: "14px",
          } as any)}
        >
          {t("infectionControl.worklist.filters.treatmentDay")}:
        </Heading>
        <Tooltip
          title={t("infectionControl.worklist.filters.treatmentDayHint")}
        >
          <DayRange>
            <InputNumber
              id="treatmentDayFrom"
              prefix="D"
              min={1}
              max={365}
              precision={0}
              placeholder={t(
                "infectionControl.worklist.filters.treatmentDayFrom",
              )}
              value={values.treatmentDayFrom}
              onChange={(treatmentDayFrom: any) =>
                setFieldValue({ treatmentDayFrom: treatmentDayFrom || null })
              }
            />
            <span>–</span>
            <InputNumber
              id="treatmentDayTo"
              prefix="D"
              min={1}
              max={365}
              precision={0}
              placeholder={t(
                "infectionControl.worklist.filters.treatmentDayTo",
              )}
              value={values.treatmentDayTo}
              onChange={(treatmentDayTo: any) =>
                setFieldValue({ treatmentDayTo: treatmentDayTo || null })
              }
            />
          </DayRange>
        </Tooltip>
      </Col>
    </>
  );
}
