import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { selectItemToSaveThunk } from "store/ducks/intervention/thunk";
import {
  checkScreeningThunk,
  fetchPrescriptionDrugPeriodThunk,
} from "store/ducks/prescriptions/thunk";
import { selectPrescriptionDrugThunk } from "store/ducks/prescriptionDrugs/thunk";

import PrescriptionDrugList from "components/Screening/PrescriptionDrug/PrescriptionDrugList";

const mapStateToProps = ({ prescriptions, auth, user, intervention }) => ({
  dataSource: prescriptions.single.diet.list,
  listRaw: prescriptions.single.data.dietRaw,
  isFetching: prescriptions.single.isFetching,
  headers: prescriptions.single.data.headers,
  aggregated: prescriptions.single.data.agg,
  checkPrescriptionDrug: prescriptions.single.diet.checkPrescriptionDrug,
  periodObject: prescriptions.single.diet.period,
  access_token: auth.identify.access_token,
  weight: prescriptions.single.data.weight,
  idPrescription: prescriptions.single.data.idPrescription,
  idSegment: prescriptions.single.data.idSegment,
  idHospital: prescriptions.single.data.idHospital,
  admissionNumber: prescriptions.single.data.admissionNumber,
  uniqueDrugs: prescriptions.single.data.uniqueDrugs,
  isCheckingPrescription: prescriptions.single.check.isChecking,
  roles: user.account.roles,
  features: user.account.features,
  permissions: user.account.permissions,
  interventions: prescriptions.single.intervention.list,
  isSavingIntervention: intervention.maybeCreateOrUpdate.isSaving,
  isCpoe: prescriptions.single.data.isCpoe,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      checkScreening: checkScreeningThunk,
      fetchPeriod: fetchPrescriptionDrugPeriodThunk,
      select: selectItemToSaveThunk,
      selectPrescriptionDrug: selectPrescriptionDrugThunk,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionDrugList);
