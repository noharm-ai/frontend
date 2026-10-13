import { useMemo } from "react";

import { useAppSelector } from "src/store";
import ExamCard from "components/Screening/Exam/Card";
import { usePatientName } from "hooks/usePatientName";
import { formatDate } from "utils/date";
import { isResistantInUse } from "features/culture/cultureResistance";

import {
  IExamCardItem,
  IInfectionControlPatient,
} from "../InfectionControlSlice";

interface InfectionControlExamsProps {
  patient: IInfectionControlPatient;
  // the latest prescription of the admission: the cultures are flagged
  // against its drugs, as the screening flags them
  idPrescription: string;
  exams: IExamCardItem[];
  alertExams: number;
}

/**
 * The exams and culture card of the screening, for the admission's latest
 * prescription. The exams come with the antimicrobial timeline; the cultures
 * are requested by the card when its culture tab is opened
 */
export function InfectionControlExams({
  patient,
  idPrescription,
  exams,
  alertExams,
}: InfectionControlExamsProps) {
  const cultures = useAppSelector((state) => state.cultures);
  // the legacy ducks are persisted untyped
  const siderCollapsed = useAppSelector(
    (state: any) => state.app.sider.collapsed,
  );
  const { name } = usePatientName(patient.idPatient);

  // the culture tab says when a resistant drug is in use, a count the
  // screening gets with the prescription (cultureStats). This page does not
  // load the prescription, so it is counted from the cultures once the tab
  // has loaded them
  const resistantInUse =
    `${cultures.idPrescription}` === `${idPrescription}`
      ? cultures.list.filter(isResistantInUse).length
      : 0;

  // the fields of the prescription the card and its culture report read
  const prescription = useMemo(
    () => ({
      idPrescription,
      idPatient: patient.idPatient,
      admissionNumber: patient.admissionNumber,
      namePatient: name,
      birthdateFormat: formatDate(patient.birthdate) ?? "",
      cultureStats: { resistantInUse },
    }),
    [idPrescription, patient, name, resistantInUse],
  );

  return (
    <ExamCard
      exams={exams}
      count={alertExams}
      admissionNumber={patient.admissionNumber}
      prescription={prescription}
      siderCollapsed={siderCollapsed}
    />
  );
}
