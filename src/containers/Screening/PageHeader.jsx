import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import security from "services/security";

import {
  checkScreeningThunk,
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
  security: security(user.account.roles),
  featureService: FeatureService(user.account.features),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      checkScreening: checkScreeningThunk,
      incrementClinicalNotes: incrementClinicalNotesThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);
