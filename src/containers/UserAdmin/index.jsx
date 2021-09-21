import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  fetchUsersListThunk
} from '@store/ducks/userAdmin/thunk';
import UserAdmin from '@components/UserAdmin';

const mapStateToProps = ({ users }) => ({ 
  error: users.error,
  list: users.list,
  isFetching: users.isFetching
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchUsersList: fetchUsersListThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(UserAdmin);
