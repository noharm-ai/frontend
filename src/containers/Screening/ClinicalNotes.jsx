import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  fetchClinicalNotesListThunk,
  selectClinicalNoteThunk,
  updateClinicalNoteThunk
} from '@store/ducks/clinicalNotes/thunk';

import ClinicalNotes from '@components/Screening/ClinicalNotes';

const mapStateToProps = ({ clinicalNotes }) => ({
  isFetching: clinicalNotes.isFetching,
  error: clinicalNotes.error,
  list: clinicalNotes.list,
  selected: clinicalNotes.single
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetch: fetchClinicalNotesListThunk,
      select: selectClinicalNoteThunk,
      update: updateClinicalNoteThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ClinicalNotes);
