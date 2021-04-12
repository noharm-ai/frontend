import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { fetchScreeningThunk } from '@store/ducks/prescriptions/thunk';
import Conciliation from '@components/Conciliation';

const mapStateToProps = ({ prescriptions }) => ({
  error: prescriptions.single.error,
  isFetching: prescriptions.single.isFetching
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchScreeningById: fetchScreeningThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Conciliation);
