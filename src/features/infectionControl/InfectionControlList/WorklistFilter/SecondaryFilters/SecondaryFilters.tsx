import { useContext } from "react";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { InputNumber, Select } from "components/Inputs";
import Switch from "components/Switch";
import Tooltip from "components/Tooltip";
import FieldSubstanceAutocomplete from "features/fields/FieldSubstanceAutocomplete/FieldSubstanceAutocomplete";
import { AWARE_LEVELS } from "features/culture/awareLevel";

import { ITreatmentDays } from "../../../InfectionControlListSlice";
import { AntimicrobialFilter } from "../AntimicrobialFilter/AntimicrobialFilter";
import { DayRange } from "./SecondaryFilters.style";

/**
 * The filters under "see more": what runs (antimicrobial and its treatment
 * day, substance, AWaRe level), non-conformity, admissions and overdue review
 */
export function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;
  const treatmentDays: ITreatmentDays = values.treatmentDays ?? {
    from: null,
    to: null,
  };

  /** Change one end of the day range; with both empty there is no filter */
  const setTreatmentDay = (end: keyof ITreatmentDays, day: number | null) => {
    const next = { ...treatmentDays, [end]: day || null };
    setFieldValue({ treatmentDays: next.from || next.to ? next : null });
  };

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xl={18} xxl={14}>
        <Heading {...({ as: "label", htmlFor: "drugs", $size: "14px" } as any)}>
          {t("infectionControl.worklist.filters.drugs")}:
        </Heading>
        <AntimicrobialFilter
          id="drugs"
          value={values.drugs ?? []}
          onChange={(drugs) => setFieldValue({ drugs })}
        />
      </Col>

      <Col md={24} xl={18} xxl={14}>
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
              value={treatmentDays.from}
              onChange={(day: any) => setTreatmentDay("from", day)}
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
              value={treatmentDays.to}
              onChange={(day: any) => setTreatmentDay("to", day)}
            />
          </DayRange>
        </Tooltip>
      </Col>

      <Col md={24} xl={18} xxl={14}>
        <Heading
          {...({ as: "label", htmlFor: "substances", $size: "14px" } as any)}
        >
          {t("infectionControl.worklist.filters.substances")}:
        </Heading>
        <FieldSubstanceAutocomplete
          id="substances"
          style={{ width: "100%" }}
          maxTagCount="responsive"
          value={values.substances}
          onChange={(substances: any) =>
            setFieldValue({
              substances: (substances ?? []).map(
                ({ value, label }: { value: number; label: string }) => ({
                  value,
                  label,
                }),
              ),
            })
          }
        />
      </Col>

      <Col md={24} xl={18} xxl={14}>
        <Heading
          {...({ as: "label", htmlFor: "awareLevels", $size: "14px" } as any)}
        >
          {t("infectionControl.worklist.filters.awareLevels")}:
        </Heading>
        <Select
          id="awareLevels"
          style={{ width: "100%" }}
          mode="multiple"
          allowClear
          placeholder={t(
            "infectionControl.worklist.filters.awareLevelsPlaceholder",
          )}
          value={values.awareLevels}
          onChange={(awareLevels: any) => setFieldValue({ awareLevels })}
        >
          {AWARE_LEVELS.map((level) => (
            <Select.Option key={level} value={level}>
              {t(`culture.awareLevel.${level}`)}
            </Select.Option>
          ))}
        </Select>
      </Col>

      <Col md={24} xl={18} xxl={14}>
        <Heading
          {...({ as: "label", htmlFor: "nonConforming", $size: "14px" } as any)}
        >
          {t("infectionControl.worklist.filters.nonConforming")}:
        </Heading>
        <div>
          <Switch
            id="nonConforming"
            checked={!!values.nonConforming}
            onChange={(nonConforming: boolean) =>
              setFieldValue({ nonConforming })
            }
          />
        </div>
      </Col>

      <Col md={24} xl={18} xxl={14}>
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

      <Col md={24} xl={18} xxl={14}>
        <Heading
          {...({ as: "label", htmlFor: "overdueReview", $size: "14px" } as any)}
        >
          {t("infectionControl.worklist.filters.overdueReview")}:
        </Heading>
        <div>
          <Switch
            id="overdueReview"
            checked={!!values.overdueReview}
            onChange={(overdueReview: boolean) =>
              setFieldValue({ overdueReview })
            }
          />
        </div>
      </Col>
    </Row>
  );
}
