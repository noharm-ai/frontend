import { TRAINING_SEGMENT_ADULT_ID } from "./segments";

/**
 * Ids live in a reserved 99xxxx range so training departments can never
 * collide with a real hospital's departments (see fixtures/patients.ts for
 * the same convention).
 */
export const TRAINING_DEPARTMENT_ICU_ID = 990101;

export const TRAINING_DEPARTMENTS = [
  {
    idDepartment: TRAINING_DEPARTMENT_ICU_ID,
    idSegment: TRAINING_SEGMENT_ADULT_ID,
    label: "Setor UTI",
  },
];
