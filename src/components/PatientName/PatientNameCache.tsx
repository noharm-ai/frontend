import { Spin } from "antd";
import { usePatientName } from "hooks/usePatientName";

interface Props {
  idPatient: number | string;
}

export default function PatientNameCache({ idPatient }: Props) {
  const { name, isLoading } = usePatientName(idPatient);

  if (isLoading && !name) return <Spin size="small" />;

  return <span>{name ?? `Paciente ${idPatient}`}</span>;
}
