import withLayout from "src/lib/withLayout";
import { AdmissionPrescription } from "features/prescription/AdmissionPrescription/AdmissionPrescription";

export const AdmissionPrescriptionPage = withLayout(AdmissionPrescription, {
  pageTitle: "Prescrição",
  defaultSelectedKeys: "/",
});
