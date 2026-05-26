import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { checkScreeningThunk } from "store/ducks/prescriptions/thunk";
import PageHeader from "pages/Screening/PageHeader";

const mapStateToProps = ({ prescriptions, user }) => ({
  prescription: {
    check: {
      ...prescriptions.single.check,
    },
    content: prescriptions.single.data,
  },
  prescriptionList: prescriptions.single.prescription.list,
  type: "conciliation",
  userId: user.account.userId,
  roles: user.account.roles,
  features: user.account.features,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      checkScreening: checkScreeningThunk,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);
