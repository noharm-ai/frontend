import { stringify, createSlug } from "./utils";

interface SegmentInput {
  minAge?: number | string | null;
  maxAge?: number | string | null;
  minWeight?: number | string | null;
  maxWeight?: number | string | null;
  id: number | string;
  description: string;
  [key: string]: unknown;
}

export const transformSegment = ({
  minAge,
  maxAge,
  minWeight,
  maxWeight,
  id,
  description,
  ...segment
}: SegmentInput) => ({
  ...segment,
  id,
  minAge,
  maxAge,
  minWeight,
  maxWeight,
  description,
  minMaxAge: stringify([minAge, maxAge], "#", " - "),
  minMaxWeight: stringify([minWeight, maxWeight], "#", " - "),
  slug: createSlug(description, id),
});

export const transformSegments = (segments: SegmentInput[]) =>
  segments.map(transformSegment);
