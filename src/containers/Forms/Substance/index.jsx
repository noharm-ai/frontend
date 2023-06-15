import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  saveOutlierSubstanceThunk,
  fetchSubstanceSingleThunk,
} from "store/ducks/outliers/thunk";

import FormSubstance from "components/Forms/Substance";

const mapStateToProps = ({ outliers }) => ({
  saveStatus: outliers.substance.single,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      save: saveOutlierSubstanceThunk,
      fetchSubstance: fetchSubstanceSingleThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormSubstance);
