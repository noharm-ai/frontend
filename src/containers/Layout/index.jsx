import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { logoutThunk } from '@store/ducks/auth/thunk';
import { setSiderThunk } from '@store/ducks/app/thunk';
import Layout from '@components/Layout';
import security from '@services/security';

import navigation from './navigation';

const mapStateToProps = ({ user, app }) => ({
  user,
  navigation,
  app,
  security: security(user.account.roles)
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      doLogout: logoutThunk,
      setAppSider: setSiderThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
