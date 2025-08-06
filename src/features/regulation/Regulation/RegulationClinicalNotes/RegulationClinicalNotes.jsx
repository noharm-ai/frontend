import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  fetchClinicalNotesListThunk,
  fetchExtraClinicalNotesListThunk,
  selectClinicalNoteThunk,
  updateClinicalNoteThunk,
} from "store/ducks/clinicalNotes/thunk";

import ClinicalNotes from "components/Screening/ClinicalNotes";

const mapStateToProps = ({ regulation, clinicalNotes, user, auth }) => ({
  isFetching: clinicalNotes.isFetching,
  isFetchingExtra: clinicalNotes.isFetchingExtra,
  error: clinicalNotes.error,
  list: clinicalNotes.list,
  dates: clinicalNotes.dates,
  positionList: clinicalNotes.positionList,
  previousAdmissions: clinicalNotes.previousAdmissions,
  selected: clinicalNotes.single,
  saveStatus: clinicalNotes.save,
  access_token: auth.identify.access_token,
  userId: user.account.userId,
  admissionNumber: regulation.regulation.data.admissionNumber,
  roles: user.account.roles,
  features: user.account.features,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetch: fetchClinicalNotesListThunk,
      fetchByDate: fetchExtraClinicalNotesListThunk,
      select: selectClinicalNoteThunk,
      update: updateClinicalNoteThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ClinicalNotes);
