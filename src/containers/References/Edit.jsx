import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  selectItemToSaveThunk,
  updateSelectedItemToSaveOutlierThunk
} from '@store/ducks/outliers/thunk';

import Edit from '@components/References/Edit';

const mapStateToProps = ({ outliers }) => ({
  outlier: outliers.edit
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      selectOutlier: selectItemToSaveThunk,
      updateSelectedOutlier: updateSelectedItemToSaveOutlierThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Edit);
