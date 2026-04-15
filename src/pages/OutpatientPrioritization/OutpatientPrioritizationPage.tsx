// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — lib/withLayout is a JS file without type declarations
import withLayout from "../../lib/withLayout";
import { OutpatientPrioritization } from "features/outpatient/OutpatientPrioritization/OutpatientPrioritization";

export const OutpatientPrioritizationPage = withLayout(
  OutpatientPrioritization,
  {}
);
