import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import PageHeader from "pages/InterventionList/PageHeader";

const mapStateToProps = ({ user }) => ({ userName: user.account.userName });
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);
