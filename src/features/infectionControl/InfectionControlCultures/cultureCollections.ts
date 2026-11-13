import {
  RESULT_RESISTANT,
  RESULT_SUSCEPTIBLE,
} from "features/culture/cultureResistance";
import type { ICultureDrug } from "features/culture/cultureTypes";

import type {
  IAntibiogramResult,
  ICultureCollection,
  IRecentCultures,
} from "../InfectionControlSlice";

/**
 * How the culture card reads a collection: its microorganisms, each with the
 * antibiogram of every culture of the collection, and the drugs of the
 * prescription among them.
 */

// a microorganism of a collection and its antibiogram, one result per drug
export interface ICollectionOrganism {
  // null for antibiogram rows that name none
  microorganism: string | null;
  results: IAntibiogramResult[];
}

export interface IResultCounts {
  resistant: number;
  susceptible: number;
  // a wording the backend could not classify (intermediate, dose dependent
  // without the word "sensível"...): never read as either
  other: number;
}

// the lab writes the drug as it pleases: case and accents don't tell drugs
// apart
export const drugKey = (drug: string) =>
  drug.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toUpperCase();

/**
 * The collections of the payload. A backend older than the collections only
 * sends the latest culture of each exam and material: each stands for a
 * collection, without its antibiogram
 */
export const collectionsOf = (
  data: IRecentCultures | null,
): ICultureCollection[] => {
  if (!data) return [];
  if (data.collections) return data.collections;

  return data.cultures.map((culture) => ({
    id: culture.id,
    examName: culture.examName,
    material: culture.material,
    collectionDate: culture.collectionDate,
    cultures: [{ ...culture, antibiogram: [] }],
  }));
};

/**
 * The microorganisms of a collection, in the order the cultures name them,
 * each with its antibiogram. A drug tested again by a later culture of the
 * collection (a final report after a partial one) keeps the later result: the
 * cultures come in the order the lab released them
 */
export const organismsOf = (
  collection: ICultureCollection,
): ICollectionOrganism[] => {
  const organisms = new Map<string | null, Map<string, IAntibiogramResult>>();

  collection.cultures.forEach((culture) => {
    culture.microorganisms.forEach((name) => {
      if (!organisms.has(name)) organisms.set(name, new Map());
    });
  });

  collection.cultures.forEach((culture) => {
    (culture.antibiogram ?? []).forEach((row) => {
      if (!organisms.has(row.microorganism)) {
        organisms.set(row.microorganism, new Map());
      }
      organisms.get(row.microorganism)!.set(drugKey(row.drug), row);
    });
  });

  return [...organisms.entries()].map(([microorganism, results]) => ({
    microorganism,
    results: [...results.values()],
  }));
};

// the tag colour of a result: one the backend could not classify is neither
// red nor green
export const resultColor = (resultType: string) => {
  if (resultType === RESULT_RESISTANT) return "red";
  if (resultType === RESULT_SUSCEPTIBLE) return "green";

  return "gold";
};

export const hasIsolate = (collection: ICultureCollection) =>
  collection.cultures.some((culture) => culture.microorganisms.length > 0);

export const countResults = (results: IAntibiogramResult[]): IResultCounts =>
  results.reduce(
    (counts, row) => {
      if (row.resultType === RESULT_RESISTANT) counts.resistant += 1;
      else if (row.resultType === RESULT_SUSCEPTIBLE) counts.susceptible += 1;
      else counts.other += 1;

      return counts;
    },
    { resistant: 0, susceptible: 0, other: 0 },
  );

/**
 * The drugs of the prescription the lab tests, by drugKey. The cultures by
 * drug know them: the backend compares their substance to the prescription
 * (services/alert_service), and they carry the lab's name of the drug, the
 * one the antibiogram rows carry
 */
export const prescribedDrugsOf = (
  culturesByDrug: ICultureDrug[] | null | undefined,
): Set<string> =>
  new Set(
    (culturesByDrug ?? [])
      .filter((drug) => drug.prescribed)
      .map((drug) => drugKey(drug.drug)),
  );

export const isInUse = (row: IAntibiogramResult, prescribed: Set<string>) =>
  prescribed.has(drugKey(row.drug));

// the results of the drugs of the prescription first, the resistant ones
// first among them; the lab's order otherwise
export const inUseFirst = (
  results: IAntibiogramResult[],
  prescribed: Set<string>,
): IAntibiogramResult[] => {
  const rank = (row: IAntibiogramResult) => {
    if (!isInUse(row, prescribed)) return 2;
    return row.resultType === RESULT_RESISTANT ? 0 : 1;
  };

  return [...results].sort((a, b) => rank(a) - rank(b));
};

/**
 * A drug of the prescription the lab found resistant in the collection: what
 * the card must make impossible to miss
 */
export const hasResistantInUse = (
  collection: ICultureCollection,
  prescribed: Set<string>,
) =>
  prescribed.size > 0 &&
  collection.cultures.some((culture) =>
    (culture.antibiogram ?? []).some(
      (row) => row.resultType === RESULT_RESISTANT && isInUse(row, prescribed),
    ),
  );

export type CollectionFilter = "all" | "isolated" | "resistantInUse";

export const filterCollections = (
  collections: ICultureCollection[],
  filter: CollectionFilter,
  prescribed: Set<string>,
) => {
  if (filter === "isolated") return collections.filter(hasIsolate);
  if (filter === "resistantInUse") {
    return collections.filter((c) => hasResistantInUse(c, prescribed));
  }

  return collections;
};
