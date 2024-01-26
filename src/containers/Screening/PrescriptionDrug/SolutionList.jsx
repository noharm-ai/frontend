import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  selectItemToSaveThunk,
  saveInterventionThunk,
} from "store/ducks/intervention/thunk";
import {
  checkScreeningThunk,
  updateInterventionDataThunk,
  fetchPrescriptionDrugPeriodThunk,
} from "store/ducks/prescriptions/thunk";
import {
  selectPrescriptionDrugThunk,
  savePrescriptionDrugFormThunk,
} from "store/ducks/prescriptionDrugs/thunk";

import PrescriptionDrugList from "components/Screening/PrescriptionDrug/PrescriptionDrugList";

const mapStateToProps = ({ prescriptions, auth, user, intervention }) => ({
  dataSource: prescriptions.single.solution.list,
  listRaw: prescriptions.single.data.solutionRaw,
  isFetching: prescriptions.single.isFetching,
  headers: prescriptions.single.data.headers,
  aggregated: prescriptions.single.data.agg,
  checkPrescriptionDrug: prescriptions.single.solution.checkPrescriptionDrug,
  periodObject: prescriptions.single.solution.period,
  access_token: auth.identify.access_token,
  weight: prescriptions.single.data.weight,
  idPrescription: prescriptions.single.data.idPrescription,
  idSegment: prescriptions.single.data.idSegment,
  idHospital: prescriptions.single.data.idHospital,
  admissionNumber: prescriptions.single.data.admissionNumber,
  formTemplate: prescriptions.single.data.formTemplate,
  uniqueDrugs: prescriptions.single.data.uniqueDrugs,
  isCheckingPrescription: prescriptions.single.check.isChecking,
  roles: user.account.roles,
  features: user.account.features,
  interventions: prescriptions.single.intervention.list,
  isSavingIntervention: intervention.maybeCreateOrUpdate.isSaving,
  infusion: prescriptions.single.data.infusion,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      checkScreening: checkScreeningThunk,
      fetchPeriod: fetchPrescriptionDrugPeriodThunk,
      select: selectItemToSaveThunk,
      saveIntervention: saveInterventionThunk,
      updateInterventionData: updateInterventionDataThunk,
      selectPrescriptionDrug: selectPrescriptionDrugThunk,
      savePrescriptionDrugForm: savePrescriptionDrugFormThunk,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionDrugList);
