import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { forgotPasswordThunk } from '@store/ducks/user/thunk';
import ForgotPassword from '@components/Login/ForgotPassword';

const mapStateToProps = ({ user }) => ({
  status: user.save
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      forgotPassword: forgotPasswordThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
