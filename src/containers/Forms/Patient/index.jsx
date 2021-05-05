import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { savePatientThunk } from '@store/ducks/patients/thunk';

import FormPatient from '@components/Forms/Patient';
import security from '@services/security';

const mapStateToProps = ({ prescriptions, patients, user }) => ({
  saveStatus: patients.save,
  idPrescription: prescriptions.single.data.idPrescription,
  admissionNumber: prescriptions.single.data.admissionNumber,
  weight: prescriptions.single.data.weight,
  height: prescriptions.single.data.height,
  observation: prescriptions.single.data.observation,
  clinicalNotes: prescriptions.single.data.clinicalNotes,
  notesInfo: prescriptions.single.data.notesInfo,
  notesInfoDate: prescriptions.single.data.notesInfoDate,
  security: security(user.account.roles)
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      savePatient: savePatientThunk
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormPatient);
