import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { clientUpdatePrescriptionDrugThunk } from '@store/ducks/prescriptionDrugs/thunk';
import PrescriptionDrug from '@components/Screening/PrescriptionDrug';

const mapStateToProps = ({ prescriptionDrugs }) => ({ prescriptionDrug: prescriptionDrugs.single });
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      update: clientUpdatePrescriptionDrugThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PrescriptionDrug);
