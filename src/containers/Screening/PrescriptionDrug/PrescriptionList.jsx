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

const mapStateToProps = ({
  prescriptions,
  auth,
  user,
  intervention,
  serverActions,
}) => ({
  dataSource: prescriptions.single.prescription.list,
  listRaw: prescriptions.single.data.prescriptionRaw,
  isFetching:
    prescriptions.single.isFetching ||
    serverActions.shouldUpdatePrescription.status === "loading",
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
  permissions: user.account.permissions,
  interventions: prescriptions.single.intervention.list,
  isSavingIntervention: intervention.maybeCreateOrUpdate.isSaving,
  infusion: prescriptions.single.data.infusion,
  isCpoe: prescriptions.single.data.isCpoe,
  prescriptionDate: prescriptions.single.data.prescriptionDate,
  prescriptionExpire: prescriptions.single.data.prescriptionExpire,
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
