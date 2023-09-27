import { Creators as AdminFrequencyCreators } from "./admin/frequency";
import { Creators as ClinicalNotesCreators } from "./clinicalNotes";
import { Creators as DepartmentsCreators } from "./departments";
import { Creators as DrugsCreators } from "./drugs";
import { Creators as InterventionCreators } from "./intervention";
import { Creators as MemoryCreators } from "./memory";
import { Creators as OutliersCreators } from "./outliers";
import { Creators as PatientCentralCreators } from "./patientCentral";
import { Creators as PrescriptionDrugsCreators } from "./prescriptionDrugs";
import { Creators as PrescriptionsCreators } from "./prescriptions";
import { Creators as ReportsCreators } from "./reports";
import { Creators as UserAdminCreators } from "./userAdmin";

import { reset as adminMemoryReset } from "features/admin/Memory/MemorySlice";
import { reset as adminInterventionReasonsReset } from "features/admin/InterventionReason/InterventionReasonSlice";

const { frequencyReset: adminFrequencyReset } = AdminFrequencyCreators;
const { clinicalNotesReset } = ClinicalNotesCreators;
const { departmentsReset } = DepartmentsCreators;
const { drugsReset } = DrugsCreators;
const { interventionReset } = InterventionCreators;
const { memoryReset } = MemoryCreators;
const { outliersReset } = OutliersCreators;
const { patientCentralReset } = PatientCentralCreators;
const { prescriptionDrugsReset } = PrescriptionDrugsCreators;
const { prescriptionsReset } = PrescriptionsCreators;
const { reportsReset } = ReportsCreators;
const { userAdminReset } = UserAdminCreators;

export const resetReduxState = (dispatch) => {
  dispatch(adminInterventionReasonsReset());
  dispatch(adminMemoryReset());
  dispatch(adminFrequencyReset());

  dispatch(clinicalNotesReset());
  dispatch(departmentsReset());
  dispatch(drugsReset());
  dispatch(interventionReset());
  dispatch(memoryReset());
  dispatch(outliersReset());
  dispatch(patientCentralReset());
  dispatch(prescriptionDrugsReset());
  dispatch(prescriptionsReset());
  dispatch(reportsReset());
  dispatch(userAdminReset());
};
