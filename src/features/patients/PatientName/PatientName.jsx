import { useSelector } from "react-redux";

export default function PatientName({ idPatient }) {
  const patients = useSelector((state) => state.patients.list);

  if (patients[idPatient]) {
    if (patients[idPatient].status === "success") {
      return patients[idPatient].name;
    }

    return `Error ${idPatient}`;
  }

  return `Loading ${idPatient}`;
}
