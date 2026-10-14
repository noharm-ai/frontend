import { useAppDispatch, useAppSelector } from "src/store";
import { CultureTab } from "features/culture/CultureTab/CultureTab";
import { CultureCardFooter } from "features/culture/CultureCardFooter/CultureCardFooter";
import { fetchCultures } from "features/culture/CultureSlice";

import { ByDrugFooter } from "./CulturesByDrug.style";

interface CulturesByDrugProps {
  // the latest prescription of the admission: the cultures are flagged
  // against its drugs, as the screening flags them
  idPrescription: string;
}

/**
 * The culture card of the screening, by drug: the antibiogram of each drug,
 * the ones the prescription carries flagged, and when the newest was
 * released. The other view of the same cultures the recent cultures show by
 * exam. The cultures are loaded by the card (InfectionControlCultures), whose
 * tab flags a resistant drug in use before this is opened, and whose header
 * opens the full report
 */
export function CulturesByDrug({ idPrescription }: CulturesByDrugProps) {
  const dispatch = useAppDispatch();
  const { list, status } = useAppSelector((state) => state.cultures);

  return (
    <>
      <div className="by-drug-list">
        <CultureTab
          /* what the user opened on this patient (the prediction fold, the
             details modal) does not carry over to the next one */
          key={idPrescription}
          cultures={list}
          loading={status === "loading"}
          error={status === "failed"}
          onRetry={() =>
            dispatch(fetchCultures({ idPrescription, force: true }))
          }
        />
      </div>
      <ByDrugFooter>
        <CultureCardFooter cultures={list} withReport={false} />
      </ByDrugFooter>
    </>
  );
}
