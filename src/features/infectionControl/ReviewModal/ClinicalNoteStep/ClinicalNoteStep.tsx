import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import { Alert, Button, Popconfirm, Popover } from "antd";
import { DownloadOutlined, QuestionCircleOutlined } from "@ant-design/icons";

import { Select, Textarea } from "components/Inputs";
import MemoryText from "containers/MemoryText";
import {
  IC_CLINICAL_NOTES_MEMORY_TYPE,
  IC_CLINICAL_NOTES_PRIVATE_MEMORY_TYPE,
  IC_CLINICAL_NOTES_PRIVATE_STORE_ID,
  IC_CLINICAL_NOTES_STORE_ID,
} from "utils/memory";

import { IClinicalNoteType } from "../../InfectionControlSlice";
import { ChoiceChips } from "../ChoiceChips/ChoiceChips";
import {
  CLINICAL_NOTE_VARIABLE_GROUPS,
  CLINICAL_NOTE_VARIABLES,
  fillClinicalNote,
  getDefaultTemplate,
  IClinicalNoteContext,
} from "../clinicalNoteTemplate";
import { IReviewFields } from "../reviewForm";
import { ClinicalNote, NoteVariables } from "../ReviewModal.style";

// why no note can be written: the types still loading or failed to, the
// schema without the multiple clinical notes, or no prescription to write it on
export type ClinicalNoteUnavailable =
  "loading" | "error" | "noFeature" | "noPrescription";

interface ClinicalNoteStepProps {
  // null when a note can be written
  unavailable: ClinicalNoteUnavailable | null;
  types: IClinicalNoteType[];
  // what the variables are read from, but the review being filled
  context: Omit<IClinicalNoteContext, "values" | "t">;
}

// the type the user gave their last note, picked again for the next one
const LAST_TYPE_KEY = "infectionControl.clinicalNoteType";

const readLastType = () => {
  try {
    return localStorage.getItem(LAST_TYPE_KEY);
  } catch {
    return null;
  }
};

const writeLastType = (idType: string | null) => {
  try {
    if (idType) localStorage.setItem(LAST_TYPE_KEY, idType);
  } catch {
    // only a convenience
  }
};

/**
 * The last step of the review, optional: the clinical note it writes in the
 * patient's record, started from a default text made of what was reviewed.
 * Saved templates take the variables of the review.
 */
export function ClinicalNoteStep({
  unavailable,
  types,
  context,
}: ClinicalNoteStepProps) {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<IReviewFields>();
  const { clinicalNote } = values;
  const noteContext: IClinicalNoteContext = { ...context, values, t };
  // the template filled with the review as it is now: the steps can be
  // changed in any order, after the text was filled
  const template = clinicalNote.template ?? getDefaultTemplate(t);
  const fresh = unavailable ? null : fillClinicalNote(template, noteContext);
  const edited =
    clinicalNote.generated != null &&
    clinicalNote.text !== clinicalNote.generated;
  // the user's text was filled from a review that has changed since
  const outdated =
    clinicalNote.create &&
    edited &&
    fresh != null &&
    fresh !== clinicalNote.generated;

  const fill = (fromTemplate: string) => {
    const text = fillClinicalNote(fromTemplate, noteContext);
    setFieldValue("clinicalNote.template", fromTemplate);
    setFieldValue("clinicalNote.text", text);
    setFieldValue("clinicalNote.generated", text);
  };

  // the note starts from the default text, and follows the review while the
  // user has not edited it
  useEffect(() => {
    if (fresh == null || !clinicalNote.create || edited) return;
    if (clinicalNote.text !== fresh || clinicalNote.template == null) {
      setFieldValue("clinicalNote.template", template);
      setFieldValue("clinicalNote.text", fresh);
      setFieldValue("clinicalNote.generated", fresh);
    }
  }, [
    fresh,
    template,
    edited,
    clinicalNote.create,
    clinicalNote.text,
    clinicalNote.template,
    setFieldValue,
  ]);

  // the type of the user's last note, or the only one there is
  useEffect(() => {
    if (clinicalNote.idClinicalNoteType || !types.length) return;

    const lastType = readLastType();
    if (types.some((type) => type.id === lastType)) {
      setFieldValue("clinicalNote.idClinicalNoteType", lastType);
    } else if (types.length === 1) {
      setFieldValue("clinicalNote.idClinicalNoteType", types[0].id);
    }
  }, [types, clinicalNote.idClinicalNoteType, setFieldValue]);

  const applyDefault = () => fill(getDefaultTemplate(t));

  // the variables offered when a template is saved, by group
  const variableGroups = CLINICAL_NOTE_VARIABLE_GROUPS.map((group) => ({
    label: t(`infectionControl.clinicalNote.variableGroups.${group}`),
    items: CLINICAL_NOTE_VARIABLES.filter(
      (variable) => variable.group === group,
    ).map(({ name }) => ({
      key: `{{${name}}}`,
      label: t(`infectionControl.clinicalNote.variables.${name}`),
    })),
  }));

  const variables = (
    <NoteVariables data-testid="review-note-variables">
      {CLINICAL_NOTE_VARIABLES.map(({ name }) => (
        <div key={name} style={{ display: "contents" }}>
          <dt>{`{{${name}}}`}</dt>
          <dd>{t(`infectionControl.clinicalNote.variables.${name}`)}</dd>
        </div>
      ))}
    </NoteVariables>
  );

  return (
    <ClinicalNote
      data-kb="infectionControl.review.clinicalNote"
      data-testid="review-clinical-note"
    >
      <div className="step-header">
        <h3 className="step-title">
          {t("infectionControl.clinicalNote.stepTitle")}
        </h3>
        <p className="step-legend">
          {t("infectionControl.clinicalNote.stepLegend")}
        </p>
      </div>

      <section className="summary-section">
        <ChoiceChips<"create" | "skip">
          aria-label={t("infectionControl.clinicalNote.stepTitle")}
          value={clinicalNote.create ? "create" : "skip"}
          onChange={(choice) =>
            setFieldValue("clinicalNote.create", choice === "create")
          }
          options={[
            {
              value: "create",
              label: t("infectionControl.clinicalNote.create"),
              // no note without the feature, its types, nor a prescription to
              // write it on
              disabled: !!unavailable,
            },
            {
              value: "skip",
              label: t("infectionControl.clinicalNote.skip"),
            },
          ]}
        />
      </section>

      {unavailable && (
        <Alert
          type={unavailable === "loading" ? "info" : "warning"}
          showIcon
          data-testid="review-note-unavailable"
          title={t(`infectionControl.clinicalNote.unavailable.${unavailable}`)}
        />
      )}

      {/* without the feature, the text the review would write still shows */}
      {unavailable === "noFeature" && (
        <section className="summary-section">
          <label
            className="summary-section-title"
            htmlFor="review-note-preview"
          >
            {t("infectionControl.clinicalNote.preview")}
          </label>
          <Textarea
            id="review-note-preview"
            data-testid="review-note-preview"
            autoSize={{ minRows: 12, maxRows: 24 }}
            value={fillClinicalNote(template, noteContext)}
            disabled
          />
        </section>
      )}

      {!unavailable && clinicalNote.create && (
        <>
          <section className="summary-section">
            <div className="summary-notes-header">
              <label
                className="summary-section-title"
                htmlFor="review-note-type"
              >
                {t("infectionControl.clinicalNote.type")}
              </label>
              <span className="summary-hint">
                {t("infectionControl.review.required")}
              </span>
            </div>
            <Select
              id="review-note-type"
              className="note-type"
              data-testid="review-note-type"
              placeholder={t("infectionControl.clinicalNote.typePlaceholder")}
              value={clinicalNote.idClinicalNoteType}
              onChange={(value: any) => {
                setFieldValue("clinicalNote.idClinicalNoteType", value);
                writeLastType(value);
              }}
              options={types.map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </section>

          <section className="summary-section">
            <div className="note-text-header">
              <div className="summary-notes-header">
                <label
                  className="summary-section-title"
                  htmlFor="review-note-text"
                >
                  {t("infectionControl.clinicalNote.text")}
                </label>
                <span className="summary-hint">
                  {t("infectionControl.review.required")}
                </span>
              </div>
              <div className="note-actions">
                <Popconfirm
                  title={t("infectionControl.clinicalNote.applyDefaultConfirm")}
                  okText={t("labels.yes")}
                  cancelText={t("labels.no")}
                  onConfirm={applyDefault}
                  disabled={!edited || !clinicalNote.text.trim()}
                >
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    data-testid="review-note-default"
                    onClick={() => {
                      if (!edited || !clinicalNote.text.trim()) {
                        applyDefault();
                      }
                    }}
                  >
                    {t("infectionControl.clinicalNote.applyDefault")}
                  </Button>
                </Popconfirm>
                <MemoryText
                  storeId={IC_CLINICAL_NOTES_STORE_ID}
                  memoryType={IC_CLINICAL_NOTES_MEMORY_TYPE}
                  onLoad={fill}
                  variableGroups={variableGroups}
                />
                <MemoryText
                  storeId={IC_CLINICAL_NOTES_PRIVATE_STORE_ID}
                  memoryType={IC_CLINICAL_NOTES_PRIVATE_MEMORY_TYPE}
                  privateMemory={true}
                  onLoad={fill}
                  variableGroups={variableGroups}
                />
                <Popover
                  title={t("infectionControl.clinicalNote.variablesTitle")}
                  content={variables}
                  trigger="click"
                  placement="bottomRight"
                >
                  <Button
                    size="small"
                    icon={<QuestionCircleOutlined />}
                    aria-label={t(
                      "infectionControl.clinicalNote.variablesTitle",
                    )}
                  />
                </Popover>
              </div>
            </div>
            {outdated && (
              <div className="note-outdated" data-testid="review-note-outdated">
                <span>{t("infectionControl.clinicalNote.outdated")}</span>
                <Popconfirm
                  title={t("infectionControl.clinicalNote.refillConfirm")}
                  okText={t("labels.yes")}
                  cancelText={t("labels.no")}
                  onConfirm={() => fill(template)}
                >
                  <button type="button" className="link-button">
                    {t("infectionControl.clinicalNote.refill")}
                  </button>
                </Popconfirm>
              </div>
            )}
            <Textarea
              id="review-note-text"
              data-testid="review-note-text"
              autoSize={{ minRows: 12, maxRows: 24 }}
              value={clinicalNote.text}
              onChange={(e: any) =>
                setFieldValue("clinicalNote.text", e.target.value)
              }
            />
          </section>
        </>
      )}
      {!unavailable && !clinicalNote.create && (
        <div className="note-notice" data-testid="review-note-skipped">
          {t("infectionControl.clinicalNote.skipNotice")}
        </div>
      )}
    </ClinicalNote>
  );
}
