import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import FormPatient from '@components/Forms/Patient';

const mapStateToProps = ({ prescriptions }) => ({
  idPrescription: prescriptions.single.data.idPrescription,
  admissionNumber: prescriptions.single.data.admissionNumber,
  weight: prescriptions.single.data.weight
});
const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(FormPatient);
