import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchClinicalNotesListThunk } from '@store/ducks/clinicalNotes/thunk';
import ClinicalNotesModal from '@components/Screening/ClinicalNotes/Modal';

const mapStateToProps = ({ prescriptions, clinicalNotes }) => ({
  admissionNumber: prescriptions.single.data.admissionNumber,
  clinicalNotesList: clinicalNotes.list
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchClinicalNotes: fetchClinicalNotesListThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ClinicalNotesModal);
