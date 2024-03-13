import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import security from "services/security";

import {
  checkScreeningThunk,
  reviewPatientThunk,
  incrementClinicalNotesThunk,
} from "store/ducks/prescriptions/thunk";
import PageHeader from "pages/Screening/PageHeader";
import FeatureService from "services/features";

const mapStateToProps = ({ prescriptions, user }) => ({
  prescription: {
    check: {
      ...prescriptions.single.check,
    },
    content: prescriptions.single.data,
  },
  userId: user.account.userId,
  security: security(user.account.roles),
  featureService: FeatureService(user.account.features),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      checkScreening: checkScreeningThunk,
      reviewPatient: reviewPatientThunk,
      incrementClinicalNotes: incrementClinicalNotesThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);
