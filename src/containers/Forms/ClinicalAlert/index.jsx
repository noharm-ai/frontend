import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { saveAdmissionThunk } from "store/ducks/prescriptions/thunk";

import FormClinicalAlert from "components/Forms/ClinicalAlert";

const mapStateToProps = ({ prescriptions }) => ({
  prescription: prescriptions.single,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      save: saveAdmissionThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormClinicalAlert);
