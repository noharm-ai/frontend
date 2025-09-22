import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  fetchDrugsListThunk,
  fetchDrugsUnitsListThunk,
  saveUnitCoeffiecientThunk,
} from "store/ducks/drugs/thunk";
import {
  saveOutlierThunk,
  fetchReferencesListThunk,
  selectItemToSaveThunk,
  generateDrugOutlierThunk,
  resetGenerateDrugOutlierThunk,
  selectOutlierRelationThunk,
  updateDrugDataThunk,
} from "store/ducks/outliers/thunk";
import References from "components/References";

const mapStateToProps = ({ drugs, segments, outliers }) => ({
  drugs,
  segments: {
    error: segments.error,
    list: segments.list,
    isFetching: segments.isFetching,
  },
  outliers: {
    error: outliers.error,
    list: outliers.list,
    selecteds: outliers.firstFilter,
    isFetching: outliers.isFetching,
    edit: outliers.edit,
    saveStatus: outliers.save,
    generateStatus: outliers.generateDrugOutlier,
    drugData: outliers.drugData,
    saveRelation: outliers.saveRelation,
    relationStatus: outliers.relation,
  },
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      selectOutlier: selectItemToSaveThunk,
      selectOutlierRelation: selectOutlierRelationThunk,
      saveOutlier: saveOutlierThunk,
      saveUnitCoefficient: saveUnitCoeffiecientThunk,
      fetchDrugsList: fetchDrugsListThunk,
      fetchDrugsUnitsList: fetchDrugsUnitsListThunk,
      fetchReferencesList: fetchReferencesListThunk,
      generateOutlier: generateDrugOutlierThunk,
      generateOutlierReset: resetGenerateDrugOutlierThunk,
      updateDrugData: updateDrugDataThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(References);
