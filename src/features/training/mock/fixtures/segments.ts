import { transformSegment } from "utils/transformers";

/**
 * Ids live in a reserved 99xxxx range so training segments can never collide
 * with a real hospital's segments (see fixtures/patients.ts for the same
 * convention).
 */
export const TRAINING_SEGMENT_ADULT_ID = 990001;
export const TRAINING_SEGMENT_PEDIATRIC_ID = 990002;

const rawSegment = (id: number, description: string) => ({
  id,
  description,
  minAge: undefined,
  maxAge: undefined,
  minWeight: undefined,
  maxWeight: undefined,
});

const RAW_TRAINING_SEGMENTS = [
  rawSegment(TRAINING_SEGMENT_ADULT_ID, "Segmento Adulto"),
  rawSegment(TRAINING_SEGMENT_PEDIATRIC_ID, "Segmento Pediátrico"),
];

export const TRAINING_SEGMENTS = RAW_TRAINING_SEGMENTS.map(transformSegment);
