import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import security from "services/security";

import {
  fetchSegmentsListThunk,
  fetchSegmentByIdThunk,
  selectSegmentExamThunk,
  updateSegmentExamOrderThunk,
} from "store/ducks/segments/thunk";
import Segments from "components/Segments";

const mapStateToProps = ({ segments, outliers, user, auth, app }) => ({
  segments: {
    error: segments.error,
    list: segments.list,
    isFetching: segments.isFetching,
    firstFilter: segments.firstFilter,
    single: segments.single,
    examTypes: segments.examTypes,
  },
  hospitals: app.data.hospitals,
  sortStatus: segments.sortExam,
  outliers: {
    generate: {
      ...outliers.generate,
    },
  },
  access_token: auth.identify.access_token,
  security: security(user.account.roles),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSegmentsList: fetchSegmentsListThunk,
      fetchSegmentById: fetchSegmentByIdThunk,
      selectExam: selectSegmentExamThunk,
      updateExamOrder: updateSegmentExamOrderThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Segments);
