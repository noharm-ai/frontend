import { combineReducers } from "redux";

import appReducer from "./app";
import authReducer from "./auth";
import userReducer from "./user";
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
import userAdminSlice from "features/userAdmin/UserAdminSlice";
import examModalSlice from "features/exams/ExamModal/ExamModalSlice";

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
import adminIntegrationRemote from "features/admin/IntegrationRemote/IntegrationRemoteSlice";
import adminSubstance from "features/admin/Substance/SubstanceSlice";
import adminRelation from "features/admin/Relation/RelationsSlice";
import adminDrugReferenceDrawer from "features/admin/DrugReferenceDrawer/DrugReferenceDrawerSlice";
import adminMeasureUnit from "features/admin/MeasureUnit/MeasureUnitSlice";
import adminTag from "features/admin/Tag/TagSlice";

import regulationPrioritizationSlice from "features/regulation/Prioritization/PrioritizationSlice";
import regulationSlice from "features/regulation/Regulation/RegulationSlice";

import reports from "features/reports/ReportsSlice";
import reportPatientDayReport from "features/reports/PatientDayReport/PatientDayReportSlice";
import reportPrescriptionReport from "features/reports/PrescriptionReport/PrescriptionReportSlice";
import reportInterventionReport from "features/reports/InterventionReport/InterventionReportSlice";
import reportPrescriptionAuditReport from "features/reports/PrescriptionAuditReport/PrescriptionAuditReportSlice";
import reportEconomyReport from "features/reports/EconomyReport/EconomyReportSlice";
import reportCultureReport from "features/reports/CultureReport/CultureReportSlice";
import reportAntimicrobialHistoryReport from "features/reports/AntimicrobialHistoryReport/AntimicrobialHistoryReportSlice";
import reportPrescriptionHistoryReport from "features/reports/PrescriptionHistoryReport/PrescriptionHistoryReportSlice";
import reportAlertListReport from "features/reports/AlertListReport/AlertListReportSlice";
import reportExamsRawSearchReport from "features/reports/ExamsRawSearchReport/ExamsRawSearchReportSlice";

const adminReducers = combineReducers({
  interventionReason: adminInterventionReasonReducer,
  memory: adminMemory,
  drugAttributes: adminDrugAttributes,
  integration: adminIntegration,
  integrationStatus: adminIntegrationStatus,
  integrationConfig: adminIntegrationConfig,
  integrationRemote: adminIntegrationRemote,
  segment: adminSegment,
  exam: adminExam,
  frequency: adminFrequency,
  unitConversion: adminUnitConversion,
  substance: adminSubstance,
  relation: adminRelation,
  drugReferenceDrawer: adminDrugReferenceDrawer,
  measureUnit: adminMeasureUnit,
  tag: adminTag,
});

const regulationReducers = combineReducers({
  prioritization: regulationPrioritizationSlice,
  regulation: regulationSlice,
});

const reportReducers = combineReducers({
  patientDay: reportPatientDayReport,
  prescription: reportPrescriptionReport,
  intervention: reportInterventionReport,
  prescriptionAudit: reportPrescriptionAuditReport,
  economy: reportEconomyReport,
  culture: reportCultureReport,
  antimicrobialHistory: reportAntimicrobialHistoryReport,
  prescriptionHistory: reportPrescriptionHistoryReport,
  examsRawSearch: reportExamsRawSearchReport,
  alertList: reportAlertListReport,
  reports: reports,
});

export default combineReducers({
  admin: adminReducers,
  reportsArea: reportReducers,
  regulation: regulationReducers,
  app: appReducer,
  auth: authReducer,
  user: userReducer,
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
  userAdmin: userAdminSlice,
  examsModal: examModalSlice,
});
