import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  selectItemToSaveThunk,
  saveInterventionThunk,
  clearSavedInterventionStatusThunk
} from '@store/ducks/intervention/thunk';
import {
  updateInterventionDataThunk,
  checkInterventionThunk,
  checkPrescriptionDrugThunk
} from '@store/ducks/prescriptions/thunk';
import ModalIntervention from '@components/Screening/Modal';

const mapStateToProps = ({ intervention }) => ({
  maybeCreateOrUpdate: {
    ...intervention.maybeCreateOrUpdate
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      select: selectItemToSaveThunk,
      save: saveInterventionThunk,
      reset: clearSavedInterventionStatusThunk,
      updateInterventionData: updateInterventionDataThunk,
      saveInterventionStatus: checkInterventionThunk,
      savePrescriptionDrugStatus: checkPrescriptionDrugThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ModalIntervention);
