import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  fetchSubstanceListThunk,
  updateDrugDataThunk,
  selectOutlierSubstanceThunk,
  fetchRelationListThunk,
} from "store/ducks/outliers/thunk";
import EditSubstanceComponent from "components/References/EditSubstance";

const mapStateToProps = ({ outliers, drugs }) => ({
  saveStatus: drugs.save,
  drugData: outliers.drugData,
  substance: outliers.substance,
  idDrug: outliers.firstFilter.idDrug,
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
