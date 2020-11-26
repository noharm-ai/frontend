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
  checkInterventionThunk,
  fetchPrescriptionDrugPeriodThunk
} from '@store/ducks/prescriptions/thunk';
import { selectPrescriptionDrugThunk } from '@store/ducks/prescriptionDrugs/thunk';
import PrescriptionDrugList from '@components/Screening/PrescriptionDrug/PrescriptionDrugList';

const mapStateToProps = ({ prescriptions, auth }) => ({
  dataSource: prescriptions.single.data.prescription,
  listRaw: prescriptions.single.data.prescriptionRaw,
  isFetching: prescriptions.single.isFetching,
  headers: prescriptions.single.data.headers,
  aggregated: prescriptions.single.data.agg,
  checkPrescriptionDrug: prescriptions.single.checkPrescriptionDrug,
  checkIntervention: prescriptions.single.checkIntervention,
  periodObject: prescriptions.single.period,
  access_token: auth.identify.access_token,
  weight: prescriptions.single.data.weight,
  idSegment: prescriptions.single.data.idSegment,
  admissionNumber: prescriptions.single.data.admissionNumber
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchPeriod: fetchPrescriptionDrugPeriodThunk,
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

export default connect(mapStateToProps, mapDispatchToProps)(PrescriptionDrugList);
