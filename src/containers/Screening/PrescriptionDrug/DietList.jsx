import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  selectItemToSaveThunk,
  saveInterventionThunk,
  clearSavedInterventionStatusThunk,
} from "store/ducks/intervention/thunk";
import {
  checkScreeningThunk,
  updateInterventionDataThunk,
  fetchPrescriptionDrugPeriodThunk,
} from "store/ducks/prescriptions/thunk";
import { selectPrescriptionDrugThunk } from "store/ducks/prescriptionDrugs/thunk";

import security from "services/security";
import FeatureService from "services/features";
import PrescriptionDrugList from "components/Screening/PrescriptionDrug/PrescriptionDrugList";

const mapStateToProps = ({ prescriptions, auth, user }) => ({
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
  security: security(user.account.roles),
  featureService: FeatureService(user.account.features),
  interventions: prescriptions.single.intervention.list,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      checkScreening: checkScreeningThunk,
      fetchPeriod: fetchPrescriptionDrugPeriodThunk,
      select: selectItemToSaveThunk,
      save: saveInterventionThunk,
      reset: clearSavedInterventionStatusThunk,
      updateInterventionData: updateInterventionDataThunk,
      selectPrescriptionDrug: selectPrescriptionDrugThunk,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionDrugList);
