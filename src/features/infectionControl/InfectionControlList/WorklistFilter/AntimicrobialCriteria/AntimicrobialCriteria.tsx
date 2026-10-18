import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { InputNumber } from "components/Inputs";
import Tooltip from "components/Tooltip";
import FieldSubstanceAutocomplete from "features/fields/FieldSubstanceAutocomplete/FieldSubstanceAutocomplete";

import {
  EMPTY_CRITERION,
  IAntimicrobialCriterion,
  ILabeledValue,
  ITreatmentDays,
  MAX_CRITERIA,
  isEmptyCriterion,
} from "../../../InfectionControlListSlice";
import { AntimicrobialFilter } from "../AntimicrobialFilter/AntimicrobialFilter";
import { Criteria, DayRange, Hint } from "./AntimicrobialCriteria.style";

interface AntimicrobialCriteriaProps {
  value: IAntimicrobialCriterion[];
  onChange: (criteria: IAntimicrobialCriterion[]) => void;
}

/**
 * The running antimicrobials the worklist asks for, one row each: any of its
 * drugs or substances, on a treatment day of its range. The patient must meet
 * every row, each by an antimicrobial of its own (e.g. amoxicillin on D1 and
 * vancomycin on D2). With nothing asked one empty row shows
 */
export function AntimicrobialCriteria({
  value,
  onChange,
}: AntimicrobialCriteriaProps) {
  const { t } = useTranslation();
  const rows = value.length ? value : [EMPTY_CRITERION];

  /** Keep the rows; with every row empty there is no filter */
  const save = (next: IAntimicrobialCriterion[]) =>
    onChange(next.every(isEmptyCriterion) ? [] : next);

  const change = (index: number, changes: Partial<IAntimicrobialCriterion>) =>
    save(rows.map((row, i) => (i === index ? { ...row, ...changes } : row)));

  const changeDay = (
    index: number,
    end: keyof ITreatmentDays,
    day: number | null,
  ) => {
    const days = { from: null, to: null, ...rows[index].treatmentDays };
    const next = { ...days, [end]: day || null };
    change(index, { treatmentDays: next.from || next.to ? next : null });
  };

  return (
    <>
      <Heading {...({ as: "label", htmlFor: "drugs-0", $size: "14px" } as any)}>
        {t("infectionControl.worklist.filters.antimicrobials")}:
      </Heading>
      <Hint>{t("infectionControl.worklist.filters.antimicrobialsHint")}</Hint>
      <Criteria data-testid="antimicrobial-criteria">
        {rows.map((row, index) => (
          <Row key={index} gutter={[8, 8]} align="middle">
            <Col xs={24} md={9}>
              <AntimicrobialFilter
                id={`drugs-${index}`}
                value={row.drugs}
                onChange={(drugs) => change(index, { drugs })}
              />
            </Col>
            <Col xs={24} md={8}>
              <FieldSubstanceAutocomplete
                id={`substances-${index}`}
                style={{ width: "100%" }}
                maxTagCount="responsive"
                placeholder={t(
                  "infectionControl.worklist.filters.substancesPlaceholder",
                )}
                value={row.substances}
                // one dropdown per row, not all in the first row's box
                getPopupContainer={(trigger: HTMLElement) =>
                  trigger.parentElement
                }
                onChange={(substances: ILabeledValue[] | undefined) =>
                  change(index, {
                    substances: (substances ?? []).map(({ value, label }) => ({
                      value,
                      label,
                    })),
                  })
                }
              />
            </Col>
            <Col xs={20} md={6}>
              <Tooltip
                title={t("infectionControl.worklist.filters.treatmentDayHint")}
              >
                <DayRange>
                  <InputNumber
                    id={`treatmentDayFrom-${index}`}
                    aria-label={t(
                      "infectionControl.worklist.filters.treatmentDay",
                    )}
                    prefix="D"
                    min={1}
                    max={365}
                    precision={0}
                    placeholder={t(
                      "infectionControl.worklist.filters.treatmentDayFrom",
                    )}
                    value={row.treatmentDays?.from ?? null}
                    onChange={(day: any) => changeDay(index, "from", day)}
                  />
                  <span>–</span>
                  <InputNumber
                    id={`treatmentDayTo-${index}`}
                    aria-label={t(
                      "infectionControl.worklist.filters.treatmentDay",
                    )}
                    prefix="D"
                    min={1}
                    max={365}
                    precision={0}
                    placeholder={t(
                      "infectionControl.worklist.filters.treatmentDayTo",
                    )}
                    value={row.treatmentDays?.to ?? null}
                    onChange={(day: any) => changeDay(index, "to", day)}
                  />
                </DayRange>
              </Tooltip>
            </Col>
            <Col xs={4} md={1}>
              <Tooltip
                title={t(
                  "infectionControl.worklist.filters.removeAntimicrobial",
                )}
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  aria-label={t(
                    "infectionControl.worklist.filters.removeAntimicrobial",
                  )}
                  disabled={rows.length === 1 && isEmptyCriterion(row)}
                  onClick={() => save(rows.filter((_, i) => i !== index))}
                />
              </Tooltip>
            </Col>
          </Row>
        ))}
      </Criteria>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        style={{ marginTop: 8 }}
        // a new row once the last one asks for something
        disabled={
          rows.length >= MAX_CRITERIA || isEmptyCriterion(rows[rows.length - 1])
        }
        onClick={() => onChange([...rows, EMPTY_CRITERION])}
      >
        {t("infectionControl.worklist.filters.addAntimicrobial")}
      </Button>
    </>
  );
}
