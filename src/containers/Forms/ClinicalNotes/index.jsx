import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { savePrescriptionThunk } from "store/ducks/prescriptions/thunk";
import { memoryFetchThunk } from "store/ducks/memory/thunk";

import FormClinicalNotes from "components/Forms/ClinicalNotes";

const mapStateToProps = ({ prescriptions, user }) => ({
  prescription: prescriptions.single,
  account: user.account,
  signature: user.account.signature,
  roles: user.account.roles,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMemory: memoryFetchThunk,
      save: savePrescriptionThunk,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormClinicalNotes);
