import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { updateOutlierRelationThunk } from '@store/ducks/outliers/thunk';

import Relation from '@components/References/Relation';

const mapStateToProps = ({ outliers }) => ({
  relation: outliers.saveRelation
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      update: updateOutlierRelationThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Relation);
