import withLayout from "src/lib/withLayout";
import { PrescriptionTestCasePage as PrescriptionTestCaseContent } from "features/prescription/PrescriptionTestCasePage/PrescriptionTestCasePage";

export const PrescriptionTestCasePage = withLayout(
  PrescriptionTestCaseContent,
  {
    pageTitle: "Prescrição de teste",
  },
);
