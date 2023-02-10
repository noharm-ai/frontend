import { combineReducers } from "redux";

import appReducer from "./app";
import authReducer from "./auth";
import userReducer from "./user";
import userAdminReducer from "./userAdmin";
import drugsReducer from "./drugs";
import sessionReducer from "./session";
import outliersReducer from "./outliers";
import patientsReducer from "./patients";
import segmentsReducer from "./segments";
import interventionReducer from "./intervention";
import departmentsReducer from "./departments";
import prescriptionsReducer from "./prescriptions";
import prescriptionDrugsReducer from "./prescriptionDrugs";
import reportsReducer from "./reports";
import memoryReducer from "./memory";
import clinicalNotesReducer from "./clinicalNotes";
import patientCentral from "./patientCentral";

import adminFrequencyReducer from "./admin/frequency";
import adminInterventionReasonReducer from "features/admin/InterventionReason/InterventionReasonSlice";

const adminReducers = combineReducers({
  frequency: adminFrequencyReducer,
  interventionReason: adminInterventionReasonReducer,
});

export default combineReducers({
  admin: adminReducers,
  app: appReducer,
  auth: authReducer,
  user: userReducer,
  users: userAdminReducer,
  drugs: drugsReducer,
  session: sessionReducer,
  outliers: outliersReducer,
  patients: patientsReducer,
  patientCentral: patientCentral,
  segments: segmentsReducer,
  departments: departmentsReducer,
  intervention: interventionReducer,
  prescriptions: prescriptionsReducer,
  prescriptionDrugs: prescriptionDrugsReducer,
  reports: reportsReducer,
  memory: memoryReducer,
  clinicalNotes: clinicalNotesReducer,
});
