import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  selectItemToSaveThunk,
  saveInterventionThunk,
  clearSavedInterventionStatusThunk
} from '@store/ducks/intervention/thunk';
import {
  checkPrescriptionDrugThunk,
  updateInterventionDataThunk,
  checkInterventionThunk
} from '@store/ducks/prescriptions/thunk';
import { selectPrescriptionDrugThunk } from '@store/ducks/prescriptionDrugs/thunk';
import ConciliationDrugList from '@components/Conciliation/ConciliationDrugList';

const mapStateToProps = ({ prescriptions }) => ({
  dataSource: prescriptions.single.prescription.list,
  listRaw: prescriptions.single.data.prescriptionRaw,
  isFetching: prescriptions.single.isFetching,
  checkPrescriptionDrug: prescriptions.single.prescription.checkPrescriptionDrug,
  checkIntervention: prescriptions.single.prescription.checkIntervention,
  idSegment: prescriptions.single.data.idSegment,
  admissionNumber: prescriptions.single.data.admissionNumber,
  uniqueDrugs: prescriptions.single.data.uniqueDrugs,
  currentPrescription: prescriptions.single.data.conciliaList
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      select: selectItemToSaveThunk,
      save: saveInterventionThunk,
      reset: clearSavedInterventionStatusThunk,
      savePrescriptionDrugStatus: checkPrescriptionDrugThunk,
      updateInterventionData: updateInterventionDataThunk,
      saveInterventionStatus: checkInterventionThunk,
      selectPrescriptionDrug: selectPrescriptionDrugThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ConciliationDrugList);
