import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  selectPrescriptionDrugThunk,
  savePrescriptionDrugNoteThunk
} from '@store/ducks/prescriptionDrugs/thunk';
import { updatePrescriptionDrugDataThunk } from '@store/ducks/prescriptions/thunk';

import ModalPrescriptionDrug from '@components/Screening/PrescriptionDrugModal';

const mapStateToProps = ({ prescriptionDrugs }) => ({
  prescriptionDrug: prescriptionDrugs.single
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      savePrescriptionDrug: savePrescriptionDrugNoteThunk,
      selectPrescriptionDrug: selectPrescriptionDrugThunk,
      updatePrescriptionDrugData: updatePrescriptionDrugDataThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ModalPrescriptionDrug);
