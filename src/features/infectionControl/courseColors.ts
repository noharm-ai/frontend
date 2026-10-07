import { CourseStatus } from "./InfectionControlSlice";

// the solid part of a course bar: what was already given
export const COURSE_COLORS: Record<CourseStatus, string> = {
  active: "#2f80b5",
  suspended: "#e46666",
  finished: "#9e9e9e",
};

// already prescribed but still ahead (the rest of today's prescription or of a
// CPOE order)
export const SCHEDULED_COLOR = "#a9cfe8";

// the line marking the current moment across the timeline
export const TODAY_COLOR = "#e46666";

export const DISCHARGE_COLOR = "#2e3c5a";

// the infectologist's verdict on a course, on the timeline
export const EVALUATION_COLORS = {
  conforming: "#389e0d",
  nonConforming: "#cf1322",
};
