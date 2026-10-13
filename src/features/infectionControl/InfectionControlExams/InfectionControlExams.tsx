import { useEffect, useMemo } from "react";

import { useAppDispatch, useAppSelector } from "src/store";
import ExamCard from "components/Screening/Exam/Card";
import FeaturesService from "services/features";
import { usePatientName } from "hooks/usePatientName";
import { formatDate } from "utils/date";
import { fetchCultures } from "features/culture/CultureSlice";
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
 * prescription. The exams come with the antimicrobial timeline; the screening
 * gets the culture summary with the prescription, which is not loaded here, so
 * the cultures are requested on their own
 */
export function InfectionControlExams({
  patient,
  idPrescription,
  exams,
  alertExams,
}: InfectionControlExamsProps) {
  const dispatch = useAppDispatch();
  const cultures = useAppSelector((state) => state.cultures);
  // the legacy ducks are persisted untyped
  const features = useAppSelector((state: any) => state.user.account.features);
  const siderCollapsed = useAppSelector(
    (state: any) => state.app.sider.collapsed,
  );
  const { name } = usePatientName(patient.idPatient);

  const hasCulture = FeaturesService(features).hasCulture();

  // the culture tab says when a resistant drug is in use, a count the
  // screening gets with the prescription (cultureStats). On an antimicrobial
  // page it is the point of the card, so the cultures are loaded up front
  // instead of when the tab is opened
  useEffect(() => {
    if (hasCulture) {
      dispatch(fetchCultures({ idPrescription }));
    }
  }, [hasCulture, idPrescription, dispatch]);

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
