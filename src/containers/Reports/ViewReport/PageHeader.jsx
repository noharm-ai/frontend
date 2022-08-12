import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import PageHeader from "pages/Reports/ViewReport/PageHeader";

const mapStateToProps = ({ reports }) => ({ report: reports.single });
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);
