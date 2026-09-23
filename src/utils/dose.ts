interface DoseSource {
  dose?: string | number | null;
  differentiatedDose?: string | null;
}

/**
 * Returns the differentiated dose (e.g. "2,00-4,00": a different dose for
 * each administration) when it should be shown in place of the dose, that is,
 * when it is filled and the dose itself is empty or zero.
 */
export function getDifferentiatedDose(record: DoseSource): string | null {
  const differentiatedDose = record.differentiatedDose?.trim();

  if (differentiatedDose && !Number(record.dose)) {
    return differentiatedDose;
  }

  return null;
}
