import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  selectReportThunk,
  fetchReportsListThunk,
} from "store/ducks/reports/thunk";
import Reports from "components/Reports";

const mapStateToProps = ({ reports }) => ({ reports });
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      select: selectReportThunk,
      fetchList: fetchReportsListThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Reports);
