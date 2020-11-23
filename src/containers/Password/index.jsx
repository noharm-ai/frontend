import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { resetPasswordThunk } from '@store/ducks/user/thunk';

import Password from '@components/Password';

const mapStateToProps = ({ user }) => ({
  status: user.save
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      resetPassword: resetPasswordThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Password);
