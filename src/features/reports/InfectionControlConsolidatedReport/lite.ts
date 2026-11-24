import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";

/**
 * The schema runs the infection control lite (INFECTION_CONTROL_LITE without
 * INFECTION_CONTROL, which wins): the backend keeps only its antimicrobial
 * courses, so the report has no reviews, records in force or indication to
 * show (the private backend leaves them out of a lite report).
 */
export const isLiteReport = () =>
  FeatureService.has(Feature.INFECTION_CONTROL_LITE) &&
  !FeatureService.has(Feature.INFECTION_CONTROL);
