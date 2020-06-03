import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import security from '@services/security';
import { saveDrugThunk } from '@store/ducks/drugs/thunk';
import FormDrug from '@components/Forms/Drug';

const mapStateToProps = ({ drugs, outliers, user }) => ({
  saveStatus: drugs.save,
  outlier: outliers.list.length ? outliers.list[0] : {},
  units: drugs.units,
  idSegment: outliers.firstFilter.idSegment,
  security: security(user.account.roles)
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      saveDrug: saveDrugThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormDrug);
