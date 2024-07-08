import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  checkScreeningThunk,
  reviewPatientThunk,
  incrementClinicalNotesThunk,
} from "store/ducks/prescriptions/thunk";
import PageHeader from "pages/Screening/PageHeader";

const mapStateToProps = ({ prescriptions, user }) => ({
  prescription: {
    check: {
      ...prescriptions.single.check,
    },
    content: prescriptions.single.data,
  },
  userId: user.account.userId,
  interventions: prescriptions.single.intervention.list,
  roles: user.account.roles,
  features: user.account.features,
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
