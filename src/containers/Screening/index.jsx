import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  selectItemToSaveThunk,
  saveInterventionThunk,
  clearSavedInterventionStatusThunk
} from '@store/ducks/intervention/thunk';
import {
  fetchScreeningThunk,
  fetchPrescriptionByIdThunk,
  checkPrescriptionDrugThunk,
  updateInterventionDataThunk,
  checkInterventionThunk,
  fetchPrescriptionDrugPeriodThunk
} from '@store/ducks/prescriptions/thunk';
import Screening from '@components/Screening';

const mapStateToProps = ({ prescriptions, segments, intervention }) => ({
  prescription: {
    error: prescriptions.single.error,
    message: prescriptions.single.message,
    isFetching: prescriptions.single.isFetching,
    content: prescriptions.single.data,
    checkPrescriptionDrug: prescriptions.single.checkPrescriptionDrug,
    checkIntervention: prescriptions.single.checkIntervention,
    periodObject: prescriptions.single.period
  },
  segment: {
    ...segments.single
  },
  maybeCreateOrUpdate: {
    ...intervention.maybeCreateOrUpdate
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchPrescriptionById: fetchPrescriptionByIdThunk,
      fetchScreeningById: fetchScreeningThunk,
      fetchPeriod: fetchPrescriptionDrugPeriodThunk,
      select: selectItemToSaveThunk,
      save: saveInterventionThunk,
      reset: clearSavedInterventionStatusThunk,
      savePrescriptionDrugStatus: checkPrescriptionDrugThunk,
      updateInterventionData: updateInterventionDataThunk,
      saveInterventionStatus: checkInterventionThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Screening);
