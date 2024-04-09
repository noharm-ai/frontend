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
import prescriptionSlice from "features/prescription/PrescriptionSlice";
import preferencesSlice from "features/preferences/PreferencesSlice";
import drugAttributesFormSlice from "features/drugs/DrugAttributesForm/DrugAttributesFormSlice";
import supportSlice from "features/support/SupportSlice";
import interventionOutcomeSlice from "features/intervention/InterventionOutcome/InterventionOutcomeSlice";

import adminInterventionReasonReducer from "features/admin/InterventionReason/InterventionReasonSlice";
import adminMemory from "features/admin/Memory/MemorySlice";
import adminDrugAttributes from "features/admin/DrugAttributes/DrugAttributesSlice";
import adminIntegration from "features/admin/Integration/IntegrationSlice";
import adminSegment from "features/admin/Segment/SegmentSlice";
import adminExam from "features/admin/Exam/ExamSlice";
import adminFrequency from "features/admin/Frequency/FrequencySlice";
import adminUnitConversion from "features/admin/UnitConversion/UnitConversionSlice";
import adminIntegrationStatus from "features/admin/IntegrationStatus/IntegrationStatusSlice";
import adminIntegrationConfig from "features/admin/IntegrationConfig/IntegrationConfigSlice";

import reports from "features/reports/ReportsSlice";
import reportPatientDayReport from "features/reports/PatientDayReport/PatientDayReportSlice";
import reportPrescriptionReport from "features/reports/PrescriptionReport/PrescriptionReportSlice";
import reportInterventionReport from "features/reports/InterventionReport/InterventionReportSlice";
import reportPrescriptionAuditReport from "features/reports/PrescriptionAuditReport/PrescriptionAuditReportSlice";
import reportEconomyReport from "features/reports/EconomyReport/EconomyReportSlice";

const adminReducers = combineReducers({
  interventionReason: adminInterventionReasonReducer,
  memory: adminMemory,
  drugAttributes: adminDrugAttributes,
  integration: adminIntegration,
  integrationStatus: adminIntegrationStatus,
  integrationConfig: adminIntegrationConfig,
  segment: adminSegment,
  exam: adminExam,
  frequency: adminFrequency,
  unitConversion: adminUnitConversion,
});

const reportReducers = combineReducers({
  patientDay: reportPatientDayReport,
  prescription: reportPrescriptionReport,
  intervention: reportInterventionReport,
  prescriptionAudit: reportPrescriptionAuditReport,
  economy: reportEconomyReport,
  reports: reports,
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
  prescriptionv2: prescriptionSlice,
  preferences: preferencesSlice,
  drugAttributesForm: drugAttributesFormSlice,
  support: supportSlice,
  interventionOutcome: interventionOutcomeSlice,
});
