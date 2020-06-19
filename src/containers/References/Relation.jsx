import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { updateOutlierRelationThunk, fetchSubstanceListThunk } from '@store/ducks/outliers/thunk';

import Relation from '@components/References/Relation';

const mapStateToProps = ({ outliers }) => ({
  relation: outliers.saveRelation,
  relationTypes: outliers.drugData.relationTypes,
  substance: outliers.substance
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      update: updateOutlierRelationThunk,
      fetchSubstances: fetchSubstanceListThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Relation);
