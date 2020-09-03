import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  selectItemToSaveThunk,
  saveInterventionThunk,
  clearSavedInterventionStatusThunk
} from '@store/ducks/intervention/thunk';
import {
  fetchScreeningThunk,
  checkPrescriptionDrugThunk,
  updateInterventionDataThunk,
  checkInterventionThunk,
  fetchPrescriptionDrugPeriodThunk,
  fetchPrescriptionExamsThunk
} from '@store/ducks/prescriptions/thunk';
import { selectPrescriptionDrugThunk } from '@store/ducks/prescriptionDrugs/thunk';
import Screening from '@components/Screening';

const mapStateToProps = ({ prescriptions, auth }) => ({
  error: prescriptions.single.error,
  message: prescriptions.single.message,
  isFetching: prescriptions.single.isFetching,
  content: prescriptions.single.data,
  checkPrescriptionDrug: prescriptions.single.checkPrescriptionDrug,
  checkIntervention: prescriptions.single.checkIntervention,
  periodObject: prescriptions.single.period,
  exams: prescriptions.single.exams,
  access_token: auth.identify.access_token
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchScreeningById: fetchScreeningThunk,
      fetchPeriod: fetchPrescriptionDrugPeriodThunk,
      fetchExams: fetchPrescriptionExamsThunk,
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

export default connect(mapStateToProps, mapDispatchToProps)(Screening);
