import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { saveSegmentThunk } from "store/ducks/segments/thunk";
import { fetchDepartmentsListThunk } from "store/ducks/departments/thunk";
import FormSegment from "components/Forms/Segment";

const mapStateToProps = ({ departments, segments }) => ({
  saveStatus: segments.save,
  departments: {
    error: departments.error,
    list: departments.list,
    isFetching: departments.isFetching,
  },
  firstFilter: segments.firstFilter,
  segmentDepartments: segments.single.content.departments || [],
  initialValues: {
    id: segments.single.content.id,
    description: segments.single.content.description || "",
    departments: segments.single.content.departments
      ? segments.single.content.departments.map((i) => i.idDepartment)
      : [],
  },
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      saveSegment: saveSegmentThunk,
      fetchDepartments: fetchDepartmentsListThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormSegment);
