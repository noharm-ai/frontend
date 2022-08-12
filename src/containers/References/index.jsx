import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import security from "services/security";

import {
  fetchDrugsListThunk,
  fetchDrugsUnitsListThunk,
  saveUnitCoeffiecientThunk,
} from "store/ducks/drugs/thunk";
import {
  fetchOutliersListThunk,
  saveOutlierThunk,
  fetchReferencesListThunk,
  selectItemToSaveThunk,
  generateDrugOutlierThunk,
  resetGenerateDrugOutlierThunk,
  selectOutlierRelationThunk,
  saveOutlierRelationThunk,
  updateDrugDataThunk,
} from "store/ducks/outliers/thunk";
import { fetchSegmentsListThunk } from "store/ducks/segments/thunk";
import References from "components/References";

const mapStateToProps = ({ drugs, segments, outliers, user }) => ({
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
  security: security(user.account.roles),
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      selectOutlier: selectItemToSaveThunk,
      selectOutlierRelation: selectOutlierRelationThunk,
      saveOutlier: saveOutlierThunk,
      saveOutlierRelation: saveOutlierRelationThunk,
      saveUnitCoefficient: saveUnitCoeffiecientThunk,
      fetchDrugsList: fetchDrugsListThunk,
      fetchDrugsUnitsList: fetchDrugsUnitsListThunk,
      fetchSegmentsList: fetchSegmentsListThunk,
      fetchOutliersList: fetchOutliersListThunk,
      fetchReferencesList: fetchReferencesListThunk,
      generateOutlier: generateDrugOutlierThunk,
      generateOutlierReset: resetGenerateDrugOutlierThunk,
      updateDrugData: updateDrugDataThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(References);
