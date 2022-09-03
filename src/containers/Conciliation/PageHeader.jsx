import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import security from "services/security";
import FeatureService from "services/features";

import { checkScreeningThunk } from "store/ducks/prescriptions/thunk";
import PageHeader from "pages/Screening/PageHeader";

const mapStateToProps = ({ prescriptions, user }) => ({
  prescription: {
    check: {
      ...prescriptions.single.check,
    },
    content: prescriptions.single.data,
  },
  type: "conciliation",
  security: security(user.account.roles),
  featureService: FeatureService(user.account.features),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      checkScreening: checkScreeningThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);
