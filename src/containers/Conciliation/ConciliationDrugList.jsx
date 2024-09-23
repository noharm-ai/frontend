import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  selectItemToSaveThunk,
  saveInterventionThunk,
} from "store/ducks/intervention/thunk";
import {
  updateInterventionDataThunk,
  updatePrescriptionDrugDataThunk,
} from "store/ducks/prescriptions/thunk";
import { selectPrescriptionDrugThunk } from "store/ducks/prescriptionDrugs/thunk";

import security from "services/security";
import ConciliationDrugList from "components/Conciliation/ConciliationDrugList";

const mapStateToProps = ({ prescriptions, user, intervention }) => ({
  dataSource: prescriptions.single.prescription.list,
  listRaw: prescriptions.single.data.prescriptionRaw,
  isFetching: prescriptions.single.isFetching,
  checkPrescriptionDrug:
    prescriptions.single.prescription.checkPrescriptionDrug,
  idSegment: prescriptions.single.data.idSegment,
  admissionNumber: prescriptions.single.data.admissionNumber,
  uniqueDrugs: prescriptions.single.data.uniqueDrugs,
  currentPrescription: prescriptions.single.data.conciliaList,
  security: security(user.account.roles),
  features: user.account.features,
  interventions: prescriptions.single.intervention.list,
  isSavingIntervention: intervention.maybeCreateOrUpdate.isSaving,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      select: selectItemToSaveThunk,
      saveIntervention: saveInterventionThunk,
      updateInterventionData: updateInterventionDataThunk,
      selectPrescriptionDrug: selectPrescriptionDrugThunk,
      updatePrescriptionDrugData: updatePrescriptionDrugDataThunk,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConciliationDrugList);
