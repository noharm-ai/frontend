import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { selectItemToSaveThunk } from '@store/ducks/intervention/thunk';
import { fetchScreeningThunk } from '@store/ducks/prescriptions/thunk';
import Patient from '@components/Screening/Patient';
import security from '@services/security';

const mapStateToProps = ({ prescriptions, auth, user }) => ({
  isFetching: prescriptions.single.isFetching,
  prescription: prescriptions.single.data,
  checkPrescriptionDrug: prescriptions.single.patient.checkPrescriptionDrug,
  access_token: auth.identify.access_token,
  security: security(user.account.roles)
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchScreening: fetchScreeningThunk,
      selectIntervention: selectItemToSaveThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Patient);
