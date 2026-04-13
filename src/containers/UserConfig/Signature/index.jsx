import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import Signature from "components/UserConfig/Signature";

import { memoryFetchThunk, memorySaveThunk } from "store/ducks/memory/thunk";
import { Creators as UserCreators } from "store/ducks/user";

const mapStateToProps = ({ memory, user }) => ({
  memory: memory.signature,
  userId: user.account.userId,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMemory: memoryFetchThunk,
      saveMemory: memorySaveThunk,
      setUserAccountField: UserCreators.userSetAccountField,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Signature);
