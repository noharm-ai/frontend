import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { savePrescriptionThunk } from '@store/ducks/prescriptions/thunk';

import FormClinicalNotes from '@components/Forms/ClinicalNotes';

const mapStateToProps = ({ prescriptions }) => ({
  prescription: prescriptions.single
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      save: savePrescriptionThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormClinicalNotes);
