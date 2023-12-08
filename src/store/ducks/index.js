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
import drugMeasureUnits from "features/drugs/DrugMeasureUnits/DrugMeasureUnitsSlice";
import drugFormStatus from "features/drugs/DrugFormStatus/DrugFormStatusSlice";
import lists from "features/lists/ListsSlice";
import serverActionsSlice from "features/serverActions/ServerActionsSlice";
import summaryReducer from "features/summary/SummarySlice";
import memoryDraftSlice from "features/memory/MemoryDraft/MemoryDraftSlice";
import memoryFilterSlice from "features/memory/MemoryFilter/MemoryFilterSlice";
import scoreWizardSlice from "features/outliers/ScoreWizard/ScoreWizardSlice";

import adminInterventionReasonReducer from "features/admin/InterventionReason/InterventionReasonSlice";
import adminMemory from "features/admin/Memory/MemorySlice";
import adminDrugAttributes from "features/admin/DrugAttributes/DrugAttributesSlice";
import adminIntegration from "features/admin/Integration/IntegrationSlice";
import adminSegment from "features/admin/Segment/SegmentSlice";
import adminExam from "features/admin/Exam/ExamSlice";
import adminFrequency from "features/admin/Frequency/FrequencySlice";

import reportPatientDayReport from "features/reports/PatientDayReport/PatientDayReportSlice";

const adminReducers = combineReducers({
  interventionReason: adminInterventionReasonReducer,
  memory: adminMemory,
  drugAttributes: adminDrugAttributes,
  integration: adminIntegration,
  segment: adminSegment,
  exam: adminExam,
  frequency: adminFrequency,
});

const reportReducers = combineReducers({
  patientDay: reportPatientDayReport,
});

export default combineReducers({
  admin: adminReducers,
  reportsArea: reportReducers,
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
  memoryDraft: memoryDraftSlice,
  memoryFilter: memoryFilterSlice,
  clinicalNotes: clinicalNotesReducer,
  drugMeasureUnits: drugMeasureUnits,
  drugFormStatus: drugFormStatus,
  lists: lists,
  serverActions: serverActionsSlice,
  summary: summaryReducer,
  scoreWizard: scoreWizardSlice,
});
