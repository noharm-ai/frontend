import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { savePrescriptionThunk } from '@store/ducks/prescriptions/thunk';

import FormClinicalNotes from '@components/Forms/ClinicalNotes';

const mapStateToProps = ({ prescriptions, user }) => ({
  prescription: prescriptions.single,
  account: user.account
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      save: savePrescriptionThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormClinicalNotes);
