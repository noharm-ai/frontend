import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Popconfirm, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import { Checkbox } from "components/Inputs";
import notification from "components/notification";
import { useAppDispatch, useAppSelector } from "src/store";
import { getErrorMessage } from "utils/errorHandler";

import {
  IExamTriggerCondition,
  IExamTriggerRule,
  IExamTriggerRulePayload,
  IExamTriggers,
  saveExamTriggers,
} from "../../InfectionControlSlice";
import {
  describeExamTriggerRule,
  isExamTriggerAvailable,
} from "../../examTriggers";
import { ExamTriggerForm } from "../../ExamTriggerForm/ExamTriggerForm";
import {
  IExamTriggerFormFields,
  MAX_RULES,
  ruleToPayload,
  toRulePayload,
} from "../../ExamTriggerForm/examTriggerFields";

interface ExamTriggerChoiceProps {
  // the rules shown: the schema's, or the copies the evaluation on record
  // keeps while they are not loaded
  rules: (IExamTriggerCondition & { available?: boolean })[];
  // the ones turned on for the drug
  checkedIds: string[];
  onToggle: (id: string, on: boolean) => void;
  // whether the schema's rules can be added, changed and deleted here: by who
  // writes reviews, once the rules loaded (each save replaces the whole list)
  canManage: boolean;
}

/**
 * The exam trigger rules a review turns on for a drug: a result meeting one
 * sends the patient back to pending. Who writes reviews also adds, changes
 * and deletes the schema's rules from here; a rule added here is turned on
 * for the drug. The evaluations keep the copies of the rules they made.
 */
export function ExamTriggerChoice({
  rules,
  checkedIds,
  onToggle,
  canManage,
}: ExamTriggerChoiceProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { list, exams, saveStatus } = useAppSelector(
    (state) => state.infectionControl.examTriggers,
  );
  // the rule in the form: null for a new one, undefined while it is closed
  const [editing, setEditing] = useState<IExamTriggerRule | null | undefined>(
    undefined,
  );
  const saving = saveStatus === "loading";

  if (!rules.length && !canManage) return null;

  // an exam of the catalog by name, by its reference when not listed
  const examName = (examRef: string) =>
    exams.find((exam) => exam.examRef === examRef)?.name ?? examRef;

  const save = (
    payload: IExamTriggerRulePayload[],
    onDone?: (saved: IExamTriggers) => void,
  ) =>
    dispatch(saveExamTriggers({ rules: payload })).then((response: any) => {
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        notification.success({
          message: t("infectionControl.examTriggers.settings.saved"),
        });
        onDone?.(response.payload);
      }
    });

  const onSaveRule = (fields: IExamTriggerFormFields) => {
    const rule = toRulePayload(fields);
    const known = new Set(list.map((item) => item.id));

    save(
      fields.id
        ? list.map((item) =>
            item.id === fields.id ? rule : ruleToPayload(item),
          )
        : [...list.map(ruleToPayload), rule],
      (saved) => {
        setEditing(undefined);
        // the rule added, for the drug it was added from
        const added = saved.rules.find((item) => !known.has(item.id));
        if (added && isExamTriggerAvailable(added)) onToggle(added.id, true);
      },
    );
  };

  const onDelete = (id: string) =>
    save(list.filter((item) => item.id !== id).map(ruleToPayload));

  const full = list.length >= MAX_RULES;

  return (
    <div
      className="drug-exam-triggers"
      data-kb="infectionControl.review.examTriggers"
      data-testid="review-exam-triggers"
    >
      <div className="drug-exam-triggers-header">
        <span className="drug-validity-label">
          {t("infectionControl.examTriggers.title")}
        </span>
        {canManage && (
          <Tooltip
            title={
              full
                ? t("infectionControl.examTriggers.settings.limit", {
                    count: MAX_RULES,
                  })
                : undefined
            }
          >
            <Button
              size="small"
              type="link"
              icon={<PlusOutlined />}
              disabled={full}
              onClick={() => setEditing(null)}
              data-testid="exam-trigger-add"
            >
              {t("infectionControl.examTriggers.settings.add")}
            </Button>
          </Tooltip>
        )}
      </div>
      {!rules.length && (
        <div className="drug-exam-triggers-empty">
          {t("infectionControl.examTriggers.settings.empty")}
        </div>
      )}
      {rules.map((rule) => {
        const checked = checkedIds.includes(rule.id);
        const available = isExamTriggerAvailable(rule);
        const schemaRule = list.find((item) => item.id === rule.id);

        // a rule no exam of the schema maps to never fires: it cannot be
        // turned on, only off when kept from before
        return (
          <div key={rule.id} data-testid="review-exam-trigger-rule">
            <div className="drug-exam-trigger-row">
              <Checkbox
                data-testid={`review-exam-trigger-${rule.id}`}
                checked={checked}
                disabled={!available && !checked}
                onChange={(e: any) => onToggle(rule.id, e.target.checked)}
              >
                {rule.name}{" "}
                <span className="drug-exam-trigger-conditions">
                  {describeExamTriggerRule(rule, t)}
                </span>
              </Checkbox>
              {canManage && schemaRule && (
                <span className="drug-exam-trigger-actions">
                  <Tooltip
                    title={t("infectionControl.examTriggers.settings.edit")}
                  >
                    <Button
                      size="small"
                      type="text"
                      icon={<EditOutlined />}
                      aria-label={t(
                        "infectionControl.examTriggers.settings.edit",
                      )}
                      onClick={() => setEditing(schemaRule)}
                    />
                  </Tooltip>
                  <Popconfirm
                    title={t(
                      "infectionControl.examTriggers.settings.deleteConfirm",
                    )}
                    description={t(
                      "infectionControl.examTriggers.settings.deleteDescription",
                    )}
                    okText={t("infectionControl.examTriggers.settings.delete")}
                    cancelText={t(
                      "infectionControl.examTriggers.settings.cancel",
                    )}
                    okButtonProps={{ danger: true, loading: saving }}
                    onConfirm={() => onDelete(rule.id)}
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label={t(
                        "infectionControl.examTriggers.settings.delete",
                      )}
                    />
                  </Popconfirm>
                </span>
              )}
            </div>
            {!available && (
              <div
                className="drug-exam-trigger-unavailable"
                data-testid={`review-exam-trigger-unavailable-${rule.id}`}
              >
                <WarningOutlined />{" "}
                {t("infectionControl.examTriggers.unavailable", {
                  exam: examName(rule.examRef),
                })}
              </div>
            )}
          </div>
        );
      })}
      {canManage && (
        <ExamTriggerForm
          open={editing !== undefined}
          rule={editing ?? null}
          exams={exams}
          saving={saving}
          onSave={onSaveRule}
          onCancel={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}
