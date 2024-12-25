import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { memoryFetchThunk, memorySaveThunk } from "store/ducks/memory/thunk";

import MemoryText from "components/MemoryText";

const mapStateToProps = ({ memory, user }) => ({
  memory,
  userId: user.account.userId,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetch: memoryFetchThunk,
      save: memorySaveThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MemoryText);
