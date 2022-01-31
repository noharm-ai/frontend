import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  selectPrescriptionDrugThunk,
  savePrescriptionDrugThunk
} from '@store/ducks/prescriptionDrugs/thunk';
import { searchDrugsThunk, fetchDrugSummaryThunk } from '@store/ducks/drugs/thunk';

import PrescriptionDrug from '@components/Forms/PrescriptionDrug';

const mapStateToProps = ({ prescriptionDrugs, drugs }) => ({
  isSaving: prescriptionDrugs.single.isSaving,
  success: prescriptionDrugs.single.success,
  error: prescriptionDrugs.single.error,
  item: prescriptionDrugs.single.item,
  drugs: drugs.search,
  drugSummary: drugs.summary
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      select: selectPrescriptionDrugThunk,
      save: savePrescriptionDrugThunk,
      searchDrugs: searchDrugsThunk,
      fetchDrugSummary: fetchDrugSummaryThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PrescriptionDrug);
