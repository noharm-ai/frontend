import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { setModalVisibilityThunk } from "src/store/ducks/prescriptions/thunk";
import { fetchClinicalNotesListThunk } from "store/ducks/clinicalNotes/thunk";
import ClinicalNotesModal from "components/Screening/ClinicalNotes/Modal";

const mapStateToProps = ({ prescriptions, clinicalNotes }) => ({
  admissionNumber: prescriptions.single.data.admissionNumber,
  clinicalNotesList: clinicalNotes.list,
  visible: prescriptions.single.actions.modalVisibility.clinicalNotes,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchClinicalNotes: fetchClinicalNotesListThunk,
      setModalVisibility: setModalVisibilityThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ClinicalNotesModal);
