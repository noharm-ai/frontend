import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { saveOutlierSubstanceThunk } from '@store/ducks/outliers/thunk';

import FormSubstance from '@components/Forms/Substance';

const mapStateToProps = ({ outliers }) => ({
  saveStatus: outliers.substance.single
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      save: saveOutlierSubstanceThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormSubstance);
