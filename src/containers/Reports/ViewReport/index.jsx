import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import ViewReport from "components/Reports/ViewReport";

const mapStateToProps = ({ reports }) => ({ report: reports.single });
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ViewReport);
