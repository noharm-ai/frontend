import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { checkScreeningThunk } from '@store/ducks/prescriptions/thunk';
import PageHeader from '@pages/Screening/PageHeader';

const mapStateToProps = ({ prescriptions }) => ({
  prescription: {
    check: {
      ...prescriptions.single.check
    },
    content: prescriptions.single.data
  }
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      checkScreening: checkScreeningThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);
