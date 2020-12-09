import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { selectItemToSaveThunk } from '@store/ducks/intervention/thunk';
import { fetchScreeningThunk } from '@store/ducks/prescriptions/thunk';
import Patient from '@components/Screening/Patient';

const mapStateToProps = ({ prescriptions, auth }) => ({
  isFetching: prescriptions.single.isFetching,
  prescription: prescriptions.single.data,
  access_token: auth.identify.access_token
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchScreening: fetchScreeningThunk,
      selectIntervention: selectItemToSaveThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Patient);
