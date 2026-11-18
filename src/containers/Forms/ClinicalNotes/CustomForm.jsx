import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { createClinicalNoteThunk } from "store/ducks/clinicalNotes/thunk";

import FormClinicalNotes from "components/Forms/ClinicalNotes/CustomForm";

const mapStateToProps = ({ prescriptions, user, clinicalNotes }) => ({
  prescription: {
    data: prescriptions.single.data,
    isSaving: clinicalNotes.save.isSaving,
    success: clinicalNotes.save.success,
    error: clinicalNotes.save.error,
  },
  account: user.account,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      save: createClinicalNoteThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormClinicalNotes);
