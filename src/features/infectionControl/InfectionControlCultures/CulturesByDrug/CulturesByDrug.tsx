import { useEffect, useMemo } from "react";

import { useAppDispatch, useAppSelector } from "src/store";
import { usePatientName } from "hooks/usePatientName";
import { formatDate } from "utils/date";
import { CultureTab } from "features/culture/CultureTab/CultureTab";
import { CultureCardFooter } from "features/culture/CultureCardFooter/CultureCardFooter";
import { fetchCultures } from "features/culture/CultureSlice";

import { IInfectionControlPatient } from "../../InfectionControlSlice";
import { ByDrugFooter } from "./CulturesByDrug.style";

interface CulturesByDrugProps {
  patient: IInfectionControlPatient;
  // the latest prescription of the admission: the cultures are flagged
  // against its drugs, as the screening flags them
  idPrescription: string;
}

/**
 * The culture card of the screening, by drug: the antibiogram of each drug,
 * the ones the prescription carries flagged, and the full report behind
 * "Ver todos". The other view of the same cultures the recent cultures show
 * by exam
 */
export function CulturesByDrug({
  patient,
  idPrescription,
}: CulturesByDrugProps) {
  const dispatch = useAppDispatch();
  const { list, status } = useAppSelector((state) => state.cultures);
  const { name } = usePatientName(patient.idPatient);

  useEffect(() => {
    // the slice skips the request while the cached list is current
    dispatch(fetchCultures({ idPrescription }));
  }, [idPrescription, status, dispatch]);

  // the fields of the prescription the culture report reads
  const prescription = useMemo(
    () => ({
      idPrescription,
      idPatient: patient.idPatient,
      admissionNumber: patient.admissionNumber,
      namePatient: name,
      birthdateFormat: formatDate(patient.birthdate) ?? "",
    }),
    [idPrescription, patient, name],
  );

  return (
    <>
      <CultureTab
        /* what the user opened on this patient (the prediction fold, the
           details modal) does not carry over to the next one */
        key={idPrescription}
        cultures={list}
        loading={status === "loading"}
        error={status === "failed"}
        onRetry={() => dispatch(fetchCultures({ idPrescription, force: true }))}
        maxHeight={480}
      />
      <ByDrugFooter>
        <CultureCardFooter cultures={list} prescription={prescription} />
      </ByDrugFooter>
    </>
  );
}
