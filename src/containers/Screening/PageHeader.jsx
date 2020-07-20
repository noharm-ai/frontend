import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import security from '@services/security';

import { checkScreeningThunk } from '@store/ducks/prescriptions/thunk';
import PageHeader from '@pages/Screening/PageHeader';

const mapStateToProps = ({ prescriptions, user }) => ({
  prescription: {
    check: {
      ...prescriptions.single.check
    },
    content: prescriptions.single.data
  },
  security: security(user.account.roles)
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      checkScreening: checkScreeningThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);
