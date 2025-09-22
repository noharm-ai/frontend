import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  generateDrugOutlierThunk,
  updateDrugDataThunk,
} from "store/ducks/outliers/thunk";

import { saveUnitCoeffiecientThunk } from "store/ducks/drugs/thunk";

import ScoreWizard from "components/References/ScoreWizard";

const mapStateToProps = ({ outliers, drugs }) => ({
  selecteds: outliers.firstFilter,
  drugData: outliers.drugData,
  drugUnits: drugs.units,
  generateStatus: outliers.generateDrugOutlier,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      generateOutlier: generateDrugOutlierThunk,
      updateDrugData: updateDrugDataThunk,
      saveUnitCoefficient: saveUnitCoeffiecientThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ScoreWizard);
