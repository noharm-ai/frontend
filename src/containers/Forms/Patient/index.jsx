import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { savePatientThunk } from "store/ducks/patients/thunk";

import FormPatient from "components/Forms/Patient";
import security from "services/security";
import FeatureService from "services/features";

const mapStateToProps = ({ prescriptions, patients, user }) => ({
  saveStatus: patients.save,
  idPrescription: prescriptions.single.data.idPrescription,
  admissionNumber: prescriptions.single.data.admissionNumber,
  weight: prescriptions.single.data.weight,
  height: prescriptions.single.data.height,
  birthdate: prescriptions.single.data.birthdate,
  gender: prescriptions.single.data.gender,
  skinColor: prescriptions.single.data.skinColor,
  dialysis: prescriptions.single.data.dialysis,
  observation: prescriptions.single.data.observation,
  clinicalNotes: prescriptions.single.data.clinicalNotes,
  notesInfo: prescriptions.single.data.notesInfo,
  notesInfoDate: prescriptions.single.data.notesInfoDate,
  dischargeDate: prescriptions.single.data.dischargeDate,
  patient: prescriptions.single.data.patient,
  security: security(user.account.roles), //todo:remove
  featureService: FeatureService(user.account.features), //todo:remove
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      savePatient: savePatientThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(FormPatient);
