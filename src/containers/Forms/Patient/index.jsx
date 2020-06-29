import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { savePatientThunk } from '@store/ducks/patients/thunk';

import FormPatient from '@components/Forms/Patient';

const mapStateToProps = ({ prescriptions, patients }) => ({
  saveStatus: patients.save,
  idPrescription: prescriptions.single.data.idPrescription,
  admissionNumber: prescriptions.single.data.admissionNumber,
  weight: prescriptions.single.data.weight,
  height: prescriptions.single.data.height
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      savePatient: savePatientThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormPatient);
