import dayjs from "dayjs";
import type { TFunction } from "i18next";

import { formatDate } from "utils/date";
import * as patientCache from "utils/patientCache";

import {
  IAntimicrobialTimeline,
  IFollowUpPending,
  IInterventionReason,
  IRecentCulture,
} from "../InfectionControlSlice";
import { formatRegimen, getAge } from "../timeline";
import {
  describeDrugEvaluation,
  getDecision,
  getNextReviewDate,
  IDrugEvaluationFields,
  IReviewFields,
  verdictLabel,
} from "./reviewForm";

/** What the variables of a clinical note are read from */
export interface IClinicalNoteContext {
  // the review being filled: the note tells what is about to be saved
  values: IReviewFields;
  timeline: IAntimicrobialTimeline;
  // null while the cultures have not loaded (or failed to)
  cultures: IRecentCulture[] | null;
  reasons: IInterventionReason[];
  invalidatedEvaluations: Record<string, IFollowUpPending[]>;
  userName: string | null;
  signature: string | null;
  t: TFunction;
}

// the groups the variables are offered in, when a template is written
export const CLINICAL_NOTE_VARIABLE_GROUPS = [
  "patient",
  "review",
  "exams",
  "utils",
] as const;

interface IClinicalNoteVariable {
  name: string;
  group: (typeof CLINICAL_NOTE_VARIABLE_GROUPS)[number];
  value: (context: IClinicalNoteContext) => string;
}

const KEY = "infectionControl.clinicalNote";

const orNotInformed = (value: string | null | undefined, t: TFunction) =>
  value || t(`${KEY}.notInformed`);

const listOr = (lines: string[], empty: string) =>
  lines.length ? lines.join("\n") : empty;

// "- MEROPENEM: Não conforme · Vigência ...", with the reasons, the
// substitute and the notes of a non-conformity on lines of their own
const describeEvaluation = (
  evaluation: IDrugEvaluationFields,
  context: IClinicalNoteContext,
) => {
  const { t, reasons, invalidatedEvaluations } = context;
  const decision = getDecision(evaluation);
  const detail = describeDrugEvaluation(evaluation, invalidatedEvaluations, t);

  if (decision === "skip" || decision == null) {
    return `- ${evaluation.drug}: ${detail}`;
  }

  const lines = [
    `- ${evaluation.drug}: ${verdictLabel(!!evaluation.conforming, t)} · ${detail}`,
  ];
  if (!evaluation.conforming) {
    const reasonNames = reasons
      .filter((reason) => evaluation.interventionReasons.includes(reason.id))
      .map((reason) => reason.name)
      .join(", ");
    if (reasonNames) {
      lines.push(
        `  ${t("infectionControl.evaluation.reasons", { reasons: reasonNames })}`,
      );
    }
    if (evaluation.substituteDrug) {
      lines.push(
        `  ${t("infectionControl.evaluation.substitute", {
          drug:
            evaluation.substituteDrug.name ?? `${evaluation.substituteDrug.id}`,
        })}`,
      );
    }
  }
  if (evaluation.notes.trim()) {
    lines.push(
      `  ${t(evaluation.conforming ? `${KEY}.observation` : `${KEY}.justification`, { text: evaluation.notes.trim() })}`,
    );
  }

  return lines.join("\n");
};

const describeEvaluations = (
  context: IClinicalNoteContext,
  filter: (evaluation: IDrugEvaluationFields) => boolean,
  empty: string,
) =>
  listOr(
    context.values.evaluations
      .filter(filter)
      .map((evaluation) => describeEvaluation(evaluation, context)),
    empty,
  );

// "- PCR: 12,5 mg/L (01/10/2026)"
const describeExams = (exams: IAntimicrobialTimeline["exams"], empty: string) =>
  listOr(
    exams.map(({ value }) => {
      if (value.value == null) return `- ${value.initials}: --`;
      const date = value.date ? ` (${formatDate(value.date)})` : "";

      return (
        `- ${value.initials}: ${value.value.toLocaleString("pt-BR")} ${value.unit ?? ""}`.trimEnd() +
        date
      );
    }),
    empty,
  );

// "- Hemocultura (Sangue) · coleta em 01/10/2026 · Staphylococcus aureus"
const describeCultures = ({ cultures, t }: IClinicalNoteContext) => {
  if (cultures == null) return t(`${KEY}.culturesUnavailable`);

  return listOr(
    cultures.map((culture) => {
      let result: string;
      if (culture.microorganisms.length) {
        result = culture.microorganisms.join(", ");
      } else if (!culture.releaseDate) {
        result = t(`${KEY}.culturePending`);
      } else {
        result = culture.gram
          ? `Gram: ${culture.gram}`
          : t(`${KEY}.cultureNoMicroorganism`);
      }

      return [
        `- ${culture.examName ?? "--"}${culture.material ? ` (${culture.material})` : ""}`,
        culture.collectionDate &&
          t(`${KEY}.cultureCollected`, {
            date: formatDate(culture.collectionDate),
          }),
        result,
      ]
        .filter(Boolean)
        .join(" · ");
    }),
    t(`${KEY}.noCultures`),
  );
};

/**
 * The variables a clinical note of the review can take, as {{name}}. Those
 * the prescription clinical notes also have keep their names there.
 */
export const CLINICAL_NOTE_VARIABLES: IClinicalNoteVariable[] = [
  {
    name: "data_atual",
    group: "utils",
    value: () => dayjs().format("DD/MM/YYYY"),
  },
  {
    name: "nome_paciente",
    group: "patient",
    value: ({ timeline, t }) =>
      patientCache.getPatient(timeline.patient.idPatient)?.name ??
      t(`${KEY}.patientFallback`, { id: timeline.patient.idPatient }),
  },
  {
    name: "dtnascimento_paciente",
    group: "patient",
    value: ({ timeline, t }) =>
      orNotInformed(
        timeline.patient.birthdate && formatDate(timeline.patient.birthdate),
        t,
      ),
  },
  {
    name: "idade_paciente",
    group: "patient",
    value: ({ timeline, t }) => {
      const age = getAge(timeline.patient.birthdate, dayjs());
      if (!age) return t(`${KEY}.notInformed`);

      return t(
        age.unit === "years"
          ? "infectionControl.patient.ageYears"
          : "infectionControl.patient.ageMonths",
        { count: age.value },
      );
    },
  },
  {
    name: "nratendimento_paciente",
    group: "patient",
    value: ({ timeline }) => `${timeline.patient.admissionNumber}`,
  },
  {
    name: "data_internacao",
    group: "patient",
    value: ({ timeline, t }) =>
      orNotInformed(
        timeline.patient.admissionDate &&
          formatDate(timeline.patient.admissionDate),
        t,
      ),
  },
  {
    name: "setor",
    group: "patient",
    value: ({ timeline, t }) => orNotInformed(timeline.patient.department, t),
  },
  {
    name: "leito",
    group: "patient",
    value: ({ timeline, t }) => orNotInformed(timeline.patient.bed, t),
  },
  {
    name: "peso_paciente",
    group: "patient",
    value: ({ timeline, t }) =>
      timeline.patient.weight
        ? `${timeline.patient.weight} Kg`
        : t(`${KEY}.notInformed`),
  },
  {
    name: "altura_paciente",
    group: "patient",
    value: ({ timeline, t }) =>
      timeline.patient.height
        ? `${timeline.patient.height} cm`
        : t(`${KEY}.notInformed`),
  },
  {
    // the courses running now, with their day of treatment and posology
    name: "antimicrobianos",
    group: "review",
    value: ({ timeline, t }) =>
      listOr(
        timeline.courses
          .filter((course) => course.status === "active")
          .map((course) => {
            const regimen = course.regimens[course.regimens.length - 1];

            return [
              `- ${course.drug}`,
              course.plannedDays != null
                ? t("infectionControl.timeline.dayPlanned", {
                    count: course.days,
                    planned: course.plannedDays,
                  })
                : t("infectionControl.timeline.day", { count: course.days }),
              regimen && formatRegimen(regimen),
            ]
              .filter(Boolean)
              .join(" · ");
          }),
        t(`${KEY}.noAntimicrobials`),
      ),
  },
  {
    // every drug of the review: its verdict, or what leaving it out keeps
    name: "avaliacoes",
    group: "review",
    value: (context) =>
      describeEvaluations(
        context,
        () => true,
        context.t(`${KEY}.noEvaluations`),
      ),
  },
  {
    name: "avaliacoes_conformes",
    group: "review",
    value: (context) =>
      describeEvaluations(
        context,
        (evaluation) => getDecision(evaluation) === "conforming",
        context.t(`${KEY}.noConforming`),
      ),
  },
  {
    name: "avaliacoes_nao_conformes",
    group: "review",
    value: (context) =>
      describeEvaluations(
        context,
        (evaluation) => getDecision(evaluation) === "nonConforming",
        context.t(`${KEY}.noNonConforming`),
      ),
  },
  {
    name: "proxima_revisao",
    group: "review",
    value: ({ values, t }) => {
      const date = getNextReviewDate(values);

      return date ? date.format("DD/MM/YYYY") : t(`${KEY}.notScheduled`);
    },
  },
  {
    name: "observacao_revisao",
    group: "review",
    value: ({ values }) => values.notes.trim() || "--",
  },
  { name: "culturas", group: "exams", value: describeCultures },
  {
    name: "exames",
    group: "exams",
    value: ({ timeline, t }) =>
      describeExams(timeline.exams, t(`${KEY}.noExams`)),
  },
  {
    name: "exames_alterados",
    group: "exams",
    value: ({ timeline, t }) =>
      describeExams(
        timeline.exams.filter((exam) => exam.value.alert),
        t(`${KEY}.noAlteredExams`),
      ),
  },
  {
    name: "assinatura",
    group: "utils",
    value: ({ signature, userName }) => signature || userName || "",
  },
];

/** A template with its variables replaced by the data of the review */
export const fillClinicalNote = (
  template: string,
  context: IClinicalNoteContext,
): string =>
  CLINICAL_NOTE_VARIABLES.reduce((text, variable) => {
    const placeholder = `{{${variable.name}}}`;

    return text.includes(placeholder)
      ? text.replaceAll(placeholder, variable.value(context))
      : text;
  }, template);

/** The template a note starts from */
export const getDefaultTemplate = (t: TFunction) =>
  // its {{variables}} are the note's, not i18next's
  t("infectionControl.clinicalNote.defaultTemplate", {
    skipInterpolation: true,
  });
