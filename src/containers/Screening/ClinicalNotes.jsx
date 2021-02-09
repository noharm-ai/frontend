import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  fetchClinicalNotesListThunk,
  selectClinicalNoteThunk
} from '@store/ducks/clinicalNotes/thunk';

import ClinicalNotes from '@components/Screening/ClinicalNotes';

const mapStateToProps = ({ clinicalNotes }) => ({
  isFetching: clinicalNotes.isFetching,
  error: clinicalNotes.error,
  list: clinicalNotes.list,
  positionList: clinicalNotes.positionList,
  selected: clinicalNotes.single
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetch: fetchClinicalNotesListThunk,
      select: selectClinicalNoteThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ClinicalNotes);
