import { useMemo } from "react";

import { useAppSelector } from "src/store";
import FeaturesService from "services/features";

import { prescribedDrugsOf } from "./cultureCollections";

/**
 * The drugs of the prescription the culture card flags, by drugKey, and
 * whether the schema reads the cultures by drug at all (models/Feature.CULTURE,
 * and a prescription to compare them to). Without them the set is empty, and
 * no culture can tell a resistance in use. The culture card loads the cultures
 * by drug; the report reads what it loaded
 */
export function usePrescribedDrugs(idPrescription: string | null) {
  const culturesByDrug = useAppSelector((state) => state.cultures.list);
  // the legacy ducks are persisted untyped
  const features = useAppSelector((state: any) => state.user.account.features);

  const hasByDrug = !!idPrescription && FeaturesService(features).hasCulture();

  const prescribed = useMemo(
    () => prescribedDrugsOf(hasByDrug ? culturesByDrug : null),
    [hasByDrug, culturesByDrug],
  );

  return { hasByDrug, prescribed };
}
