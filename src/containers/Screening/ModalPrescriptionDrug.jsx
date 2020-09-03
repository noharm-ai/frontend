import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  selectPrescriptionDrugThunk,
  savePrescriptionDrugThunk
} from '@store/ducks/prescriptionDrugs/thunk';
import { updatePrescriptionDrugDataThunk } from '@store/ducks/prescriptions/thunk';

import ModalPrescriptionDrug from '@components/Screening/PrescriptionDrugModal';

const mapStateToProps = ({ prescriptionDrugs }) => ({
  prescriptionDrug: prescriptionDrugs.single
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      savePrescriptionDrug: savePrescriptionDrugThunk,
      selectPrescriptionDrug: selectPrescriptionDrugThunk,
      updatePrescriptionDrugData: updatePrescriptionDrugDataThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ModalPrescriptionDrug);
