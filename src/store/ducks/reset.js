import { Creators as ClinicalNotesCreators } from "./clinicalNotes";
import { Creators as DepartmentsCreators } from "./departments";
import { Creators as DrugsCreators } from "./drugs";
import { Creators as InterventionCreators } from "./intervention";
import { Creators as MemoryCreators } from "./memory";
import { Creators as OutliersCreators } from "./outliers";
import { Creators as PatientCentralCreators } from "./patientCentral";
import { Creators as PrescriptionDrugsCreators } from "./prescriptionDrugs";
import { Creators as PrescriptionsCreators } from "./prescriptions";
import { Creators as UserAdminCreators } from "./userAdmin";

import { reset as adminMemoryReset } from "features/admin/Memory/MemorySlice";
import { reset as adminInterventionReasonsReset } from "features/admin/InterventionReason/InterventionReasonSlice";
import { reset as adminDrugAttributesReset } from "features/admin/DrugAttributes/DrugAttributesSlice";
import { reset as adminIntegrationReset } from "features/admin/Integration/IntegrationSlice";
import { reset as adminSegmentReset } from "features/admin/Segment/SegmentSlice";
import { reset as adminExamReset } from "features/admin/Exam/ExamSlice";
import { reset as adminFrequencyReset } from "features/admin/Frequency/FrequencySlice";

import { reset as drugFormStatusReset } from "features/drugs/DrugFormStatus/DrugFormStatusSlice";
import { reset as listsReset } from "features/lists/ListsSlice";
import { reset as memoryDraftReset } from "features/memory/MemoryDraft/MemoryDraftSlice";
import { reset as memoryFilterReset } from "features/memory/MemoryFilter/MemoryFilterSlice";
import { reset as serverActionsReset } from "features/serverActions/ServerActionsSlice";
import { reset as summaryReset } from "features/summary/SummarySlice";
import { reset as drugMeasureUnitsReset } from "features/drugs/DrugMeasureUnits/DrugMeasureUnitsSlice";
import { reset as scoreWizardReset } from "features/outliers/ScoreWizard/ScoreWizardSlice";
import { reset as prescriptionv2Reset } from "features/prescription/PrescriptionSlice";

import { reset as reportsReset } from "features/reports/ReportsSlice";
import { reset as patientDayReportReset } from "features/reports/PatientDayReport/PatientDayReportSlice";
import { reset as prescriptionReportReset } from "features/reports/PrescriptionReport/PrescriptionReportSlice";
import { reset as interventionReportReset } from "features/reports/InterventionReport/InterventionReportSlice";
import { reset as prescriptionAuditReportReset } from "features/reports/PrescriptionAuditReport/PrescriptionAuditReportSlice";

const { clinicalNotesReset } = ClinicalNotesCreators;
const { departmentsReset } = DepartmentsCreators;
const { drugsReset } = DrugsCreators;
const { interventionReset } = InterventionCreators;
const { memoryReset } = MemoryCreators;
const { outliersReset } = OutliersCreators;
const { patientCentralReset } = PatientCentralCreators;
const { prescriptionDrugsReset } = PrescriptionDrugsCreators;
const { prescriptionsReset } = PrescriptionsCreators;
const { userAdminReset } = UserAdminCreators;

export const resetReduxState = (dispatch) => {
  dispatch(adminInterventionReasonsReset());
  dispatch(adminMemoryReset());
  dispatch(adminFrequencyReset());
  dispatch(adminDrugAttributesReset());
  dispatch(adminIntegrationReset());
  dispatch(adminSegmentReset());
  dispatch(adminExamReset());
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
  dispatch(drugFormStatusReset());
  dispatch(listsReset());
  dispatch(memoryDraftReset());
  dispatch(memoryFilterReset());
  dispatch(serverActionsReset());
  dispatch(summaryReset());
  dispatch(drugMeasureUnitsReset());
  dispatch(scoreWizardReset());
  dispatch(prescriptionv2Reset());

  dispatch(reportsReset());
  dispatch(patientDayReportReset());
  dispatch(prescriptionReportReset());
  dispatch(interventionReportReset());
  dispatch(prescriptionAuditReportReset());
};
