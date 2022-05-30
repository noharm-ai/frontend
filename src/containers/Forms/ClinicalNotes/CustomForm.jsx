import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { createClinicalNoteThunk } from '@store/ducks/clinicalNotes/thunk';
import { memoryFetchThunk } from '@store/ducks/memory/thunk';

import FormClinicalNotes from '@components/Forms/ClinicalNotes/CustomForm';

const mapStateToProps = ({ prescriptions, user, memory, clinicalNotes }) => ({
  prescription: {
    data: prescriptions.single.data,
    isSaving: clinicalNotes.save.isSaving,
    success: clinicalNotes.save.success,
    error: clinicalNotes.save.error
  },
  account: user.account,
  memory
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchMemory: memoryFetchThunk,
      save: createClinicalNoteThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormClinicalNotes);
