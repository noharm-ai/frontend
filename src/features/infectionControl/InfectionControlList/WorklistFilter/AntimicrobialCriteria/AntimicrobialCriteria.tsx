import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { HelpTextIcon } from "components/HelpTextIcon/HelpTextIcon";
import { InputNumber, Radio } from "components/Inputs";
import Tooltip from "components/Tooltip";
import FieldSubstanceAutocomplete from "features/fields/FieldSubstanceAutocomplete/FieldSubstanceAutocomplete";

import {
  AntimicrobialCriterionType,
  EMPTY_CRITERION,
  IAntimicrobialCriterion,
  ILabeledValue,
  ITreatmentDays,
  MAX_CRITERIA,
  isEmptyCriterion,
} from "../../../InfectionControlListSlice";
import { AntimicrobialFilter } from "../AntimicrobialFilter/AntimicrobialFilter";
import {
  Criteria,
  Criterion,
  DayRange,
  Hint,
  Match,
  Search,
} from "./AntimicrobialCriteria.style";

interface AntimicrobialCriteriaProps {
  value: IAntimicrobialCriterion[];
  onChange: (criteria: IAntimicrobialCriterion[]) => void;
  matchAll: boolean;
  onMatchAllChange: (matchAll: boolean) => void;
}

/**
 * The running antimicrobials the worklist asks for, one row each: any of its
 * drugs, or any of its substances (each row searches one of them), on a
 * treatment day of its range. The patient meets any row, or every row with
 * matchAll, each by an antimicrobial of its own (e.g. amoxicillin on D1 and
 * vancomycin on D2); the choice shows from the second row. With nothing asked
 * one empty row shows
 */
export function AntimicrobialCriteria({
  value,
  onChange,
  matchAll,
  onMatchAllChange,
}: AntimicrobialCriteriaProps) {
  const { t } = useTranslation();
  // the type of the empty row shown when nothing is asked, which is no filter
  const [emptyType, setEmptyType] = useState<AntimicrobialCriterionType>(
    EMPTY_CRITERION.type,
  );
  const rows = value.length ? value : [{ ...EMPTY_CRITERION, type: emptyType }];

  /** Keep the rows; with every row empty there is no filter */
  const save = (next: IAntimicrobialCriterion[]) => {
    if (next.every(isEmptyCriterion)) {
      setEmptyType(next[0]?.type ?? EMPTY_CRITERION.type);
      onChange([]);
    } else {
      onChange(next);
    }
  };

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
      <div className="form-label-actions">
        <label
          htmlFor={`${rows[0].type === "drug" ? "drugs" : "substances"}-0`}
        >
          {t("infectionControl.worklist.filters.antimicrobials")}:
        </label>{" "}
        <HelpTextIcon pageKey="controle-infeccao-antimicrobianos" />
      </div>
      <Hint>{t("infectionControl.worklist.filters.antimicrobialsHint")}</Hint>
      {rows.length > 1 && (
        <Match>
          <span>
            {t("infectionControl.worklist.filters.antimicrobialsMatch")}:
          </span>
          <Radio.Group
            size="small"
            optionType="button"
            buttonStyle="solid"
            options={[
              {
                value: false,
                label: t(
                  "infectionControl.worklist.filters.antimicrobialsMatchAny",
                ),
              },
              {
                value: true,
                label: t(
                  "infectionControl.worklist.filters.antimicrobialsMatchAll",
                ),
              },
            ]}
            value={matchAll}
            onChange={({ target }: any) => onMatchAllChange(target.value)}
          />
        </Match>
      )}
      <Criteria data-testid="antimicrobial-criteria">
        {rows.map((row, index) => (
          <Criterion key={index}>
            <Search>
              <Radio.Group
                optionType="button"
                aria-label={t(
                  "infectionControl.worklist.filters.antimicrobialType",
                )}
                options={[
                  {
                    value: "drug",
                    label: t(
                      "infectionControl.worklist.filters.antimicrobialTypeDrug",
                    ),
                  },
                  {
                    value: "substance",
                    label: t(
                      "infectionControl.worklist.filters.antimicrobialTypeSubstance",
                    ),
                  },
                ]}
                value={row.type}
                // a row searches drugs or substances, never both
                onChange={({ target }: any) =>
                  change(index, {
                    type: target.value,
                    drugs: [],
                    substances: [],
                  })
                }
              />
              {row.type === "drug" ? (
                <AntimicrobialFilter
                  id={`drugs-${index}`}
                  value={row.drugs}
                  onChange={(drugs) => change(index, { drugs })}
                />
              ) : (
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
                      substances: (substances ?? []).map(
                        ({ value, label }) => ({ value, label }),
                      ),
                    })
                  }
                />
              )}
            </Search>
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
            <Tooltip
              title={t("infectionControl.worklist.filters.removeAntimicrobial")}
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
          </Criterion>
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
