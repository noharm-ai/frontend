import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { saveDrugThunk } from '@store/ducks/drugs/thunk';
import FormDrug from '@components/Forms/Drug';

const mapStateToProps = ({ drugs, outliers }) => ({
  saveStatus: drugs.save,
  outlier: outliers.list.length ? outliers.list[0] : {},
  units: drugs.units,
  idSegment: outliers.firstFilter.idSegment
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      saveDrug: saveDrugThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormDrug);
