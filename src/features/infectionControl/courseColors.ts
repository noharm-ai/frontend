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

// an exam plotted under the courses: the line in the ink of the labels, apart
// from the blues of the bars, the results out of the reference in red and the
// reference as a band
export const EXAM_COLORS = {
  line: "#5b6b8c",
  alert: "#f5222d",
  reference: "rgba(46, 60, 90, 0.07)",
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
