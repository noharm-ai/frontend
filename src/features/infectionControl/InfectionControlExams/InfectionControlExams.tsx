import { useAppSelector } from "src/store";
import ExamCard from "components/Screening/Exam/Card";

import {
  IExamCardItem,
  IInfectionControlPatient,
} from "../InfectionControlSlice";

interface InfectionControlExamsProps {
  patient: IInfectionControlPatient;
  exams: IExamCardItem[];
  alertExams: number;
}

/**
 * The exams card of the screening, for the admission's latest prescription.
 * The exams come with the antimicrobial timeline. The card's culture tab is
 * left out: the page shows the cultures in their own section, by exam and by
 * drug (InfectionControlCultures)
 */
export function InfectionControlExams({
  patient,
  exams,
  alertExams,
}: InfectionControlExamsProps) {
  // the legacy ducks are persisted untyped
  const siderCollapsed = useAppSelector(
    (state: any) => state.app.sider.collapsed,
  );

  return (
    <ExamCard
      exams={exams}
      count={alertExams}
      admissionNumber={patient.admissionNumber}
      siderCollapsed={siderCollapsed}
      hideCulture
    />
  );
}
