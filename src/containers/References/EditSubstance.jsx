import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import security from "services/security";
import {
  fetchSubstanceListThunk,
  updateDrugDataThunk,
  selectOutlierSubstanceThunk,
  fetchRelationListThunk,
} from "store/ducks/outliers/thunk";
import EditSubstanceComponent from "components/References/EditSubstance";

const mapStateToProps = ({ outliers, drugs, user }) => ({
  saveStatus: drugs.save,
  drugData: outliers.drugData,
  substance: outliers.substance,
  idDrug: outliers.firstFilter.idDrug,
  security: security(user.account.roles),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSubstances: fetchSubstanceListThunk,
      updateDrugData: updateDrugDataThunk,
      selectSubstance: selectOutlierSubstanceThunk,
      fetchRelations: fetchRelationListThunk,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditSubstanceComponent);
