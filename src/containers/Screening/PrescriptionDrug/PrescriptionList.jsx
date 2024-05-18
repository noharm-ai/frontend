import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { selectItemToSaveThunk } from "store/ducks/intervention/thunk";
import {
  checkScreeningThunk,
  fetchPrescriptionDrugPeriodThunk,
} from "store/ducks/prescriptions/thunk";
import {
  selectPrescriptionDrugThunk,
  savePrescriptionDrugFormThunk,
} from "store/ducks/prescriptionDrugs/thunk";

import PrescriptionDrugList from "components/Screening/PrescriptionDrug/PrescriptionDrugList";

const mapStateToProps = ({ prescriptions, auth, user, intervention }) => ({
  dataSource: prescriptions.single.prescription.list,
  listRaw: prescriptions.single.data.prescriptionRaw,
  isFetching: prescriptions.single.isFetching,
  headers: prescriptions.single.data.headers,
  aggregated: prescriptions.single.data.agg,
  checkPrescriptionDrug:
    prescriptions.single.prescription.checkPrescriptionDrug,
  periodObject: prescriptions.single.prescription.period,
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
      selectPrescriptionDrug: selectPrescriptionDrugThunk,
      savePrescriptionDrugForm: savePrescriptionDrugFormThunk,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionDrugList);
