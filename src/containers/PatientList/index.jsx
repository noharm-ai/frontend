import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { patientCentralFetchListThunk } from '@store/ducks/patientCentral/thunk';

import PatientList from '@components/PatientList';

const mapStateToProps = ({ patientCentral }) => ({
  error: patientCentral.error,
  list: patientCentral.list,
  isFetching: patientCentral.isFetching
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchList: patientCentralFetchListThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PatientList);
