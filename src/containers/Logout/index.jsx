import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { logoutThunk } from '@store/ducks/auth/thunk';
import Logout from '@components/Logout';

const mapStateToProps = () => ({});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      doLogout: logoutThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
