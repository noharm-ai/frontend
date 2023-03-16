import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { saveSegmentThunk } from "store/ducks/segments/thunk";
import { fetchDepartmentsListThunk } from "store/ducks/departments/thunk";
import FormSegment from "components/Forms/Segment";

const mapStateToProps = ({ segments }) => ({
  saveStatus: segments.save,
  isFetching: segments.single.isFetching,
  firstFilter: segments.firstFilter,
  segmentDepartments: segments.single.content.departments || [],
  initialValues: {
    id: segments.single.content.id,
    idHospital: segments.single.content.idHospital,
    description: segments.single.content.description || "",
    departments: segments.single.content.departments
      ? segments.single.content.departments
          .filter((i) => i.checked)
          .map((i) => i.idDepartment)
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
