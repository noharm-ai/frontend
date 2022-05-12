import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  fetchClinicalNotesListThunk,
  selectClinicalNoteThunk,
  updateClinicalNoteThunk
} from '@store/ducks/clinicalNotes/thunk';

import security from '@services/security';
import FeatureService from '@services/features';
import ClinicalNotes from '@components/Screening/ClinicalNotes';

const mapStateToProps = ({ clinicalNotes, user, auth }) => ({
  isFetching: clinicalNotes.isFetching,
  error: clinicalNotes.error,
  list: clinicalNotes.list,
  positionList: clinicalNotes.positionList,
  selected: clinicalNotes.single,
  saveStatus: clinicalNotes.save,
  security: security(user.account.roles),
  access_token: auth.identify.access_token,
  userId: user.account.userId,
  featureService: FeatureService(user.account.features)
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
