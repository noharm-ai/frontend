import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { saveUserThunk } from '@store/ducks/userAdmin/thunk';

import FormUser from '@components/Forms/User';

const mapStateToProps = ({ users }) => ({
  saveStatus: users.save,
  user: users.single
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      save: saveUserThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormUser);
