import { stringify, createSlug } from './utils';

export const transformSegment = ({
  minAge,
  maxAge,
  minWeight,
  maxWeight,
  id,
  description,
  ...segment
}) => ({
  ...segment,
  id,
  minAge,
  maxAge,
  minWeight,
  maxWeight,
  description,
  minMaxAge: stringify([minAge, maxAge], '#', ' - '),
  minMaxWeight: stringify([minWeight, maxWeight], '#', ' - '),
  slug: createSlug(description, id)
});

export const transformSegments = segments => segments.map(transformSegment);
