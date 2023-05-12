import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  fetchClinicalNotesListThunk,
  fetchExtraClinicalNotesListThunk,
  selectClinicalNoteThunk,
  updateClinicalNoteThunk,
} from "store/ducks/clinicalNotes/thunk";

import security from "services/security";
import FeatureService from "services/features";
import ClinicalNotes from "components/Screening/ClinicalNotes";

const mapStateToProps = ({ prescriptions, clinicalNotes, user, auth }) => ({
  isFetching: clinicalNotes.isFetching,
  isFetchingExtra: clinicalNotes.isFetchingExtra,
  error: clinicalNotes.error,
  list: clinicalNotes.list,
  dates: clinicalNotes.dates,
  positionList: clinicalNotes.positionList,
  selected: clinicalNotes.single,
  saveStatus: clinicalNotes.save,
  security: security(user.account.roles),
  access_token: auth.identify.access_token,
  userId: user.account.userId,
  featureService: FeatureService(user.account.features),
  admissionNumber: prescriptions.single.data.admissionNumber,
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
