import { connect } from "react-redux";

import { savePatientThunk } from "store/ducks/patients/patientsSlice";

import FormPatient from "components/Forms/Patient";

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
  idPatient: prescriptions.single.data.idPatient,
  roles: user.account.roles,
});
const mapDispatchToProps = (dispatch) => ({
  // Resolve with the response data and reject with the API error, as the form
  // expects. Not .unwrap(): the autoRefreshToken middleware wraps thunk
  // dispatches in a plain Promise, so the result has no unwrap method.
  savePatient: (params) =>
    dispatch(savePatientThunk(params)).then((action) => {
      if (savePatientThunk.rejected.match(action)) {
        throw action.payload;
      }
      if (savePatientThunk.fulfilled.match(action)) {
        return action.payload;
      }
      return action;
    }),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormPatient);
