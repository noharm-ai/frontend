import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { savePrescriptionThunk } from "store/ducks/prescriptions/thunk";
import { memoryFetchThunk } from "store/ducks/memory/thunk";

import FormClinicalNotes from "components/Forms/ClinicalNotes";
import security from "services/security";

const mapStateToProps = ({ prescriptions, user, memory }) => ({
  prescription: prescriptions.single,
  account: user.account,
  signature: memory.signature,
  security: security(user.account.roles),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMemory: memoryFetchThunk,
      save: savePrescriptionThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormClinicalNotes);
