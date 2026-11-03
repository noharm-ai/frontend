import colors from "styles/colors";

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

// the line marking the current moment across the timeline: NoHarm teal
export const TODAY_COLOR = colors.accentSecondary;

export const DISCHARGE_COLOR = "#2e3c5a";

// an exam plotted under the courses, as a chart rather than a bar: a dashed
// line in the ink of the labels, apart from the blues of the bars, the results
// in range as hollow dots and the ones out of it filled in red, the reference
// as an outlined green band. The section of the exams has a gray-blue of its
// own, so its rows are not taken for antimicrobial rows: a thick divider above
// it, a darker strip for its header and day lines a bit darker than the ones
// of the courses, so they still show on the tint
export const EXAM_COLORS = {
  line: "#5b6b8c",
  alert: "#f5222d",
  reference: "rgba(82, 196, 26, 0.14)",
  referenceOutline: "rgba(56, 158, 13, 0.55)",
  background: "#f7f9fb",
  hover: "#f0f3f7",
  header: "#eef2f6",
  divider: "#e2e7ed",
  gridLine: "#e9edf1",
};

// the infectologist's verdict on a course, on the timeline
export const EVALUATION_COLORS = {
  conforming: "#389e0d",
  nonConforming: "#cf1322",
  // on record, but an open reason made it no longer hold, from then on: the
  // orange of a pending follow-up (FollowUpStatus), lighter so it is not taken
  // for red
  invalidated: "#ffa940",
  // the symbol on the mark of where it turned pending
  invalidatedSymbol: "#873800",
};
