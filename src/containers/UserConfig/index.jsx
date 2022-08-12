import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import UserConfig from "components/UserConfig";

const mapStateToProps = ({ reports }) => ({ reports });
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UserConfig);
