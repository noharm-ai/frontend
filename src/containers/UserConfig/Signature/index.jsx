import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Signature from '@components/UserConfig/Signature';

import { memoryFetchThunk, memorySaveThunk } from '@store/ducks/memory/thunk';

const mapStateToProps = ({ memory, user }) => ({
  memory: memory.signature,
  userId: user.account.userId
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchMemory: memoryFetchThunk,
      saveMemory: memorySaveThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Signature);
