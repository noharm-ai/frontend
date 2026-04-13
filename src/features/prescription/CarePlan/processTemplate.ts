import dayjs from "dayjs";
import { formatDate } from "utils/date";
import * as patientCache from "utils/patientCache";

export const CARE_PLAN_VARIABLES = [
  { label: "Data Atual", variable: "{{data_atual}}" },
  { label: "Nome do Paciente", variable: "{{nome_paciente}}" },
  { label: "Data de Nasc.", variable: "{{dtnascimento_paciente}}" },
  { label: "Peso", variable: "{{peso_paciente}}" },
  { label: "Altura", variable: "{{altura_paciente}}" },
  { label: "Idade", variable: "{{idade_paciente}}" },
  { label: "Assinatura", variable: "{{assinatura}}" },
];

export const processCarePlanTemplate = (
  content: string,
  prescriptionData: any,
  userSignature: string,
): string => {
  const weight = prescriptionData?.weight;
  const height = prescriptionData?.height;
  const age = prescriptionData?.age;
  const idPatient = prescriptionData?.idPatient;

  return content
    .replaceAll("{{data_atual}}", formatDate(dayjs()) ?? "")
    .replaceAll(
      "{{nome_paciente}}",
      patientCache.getPatient(idPatient)?.name ?? `Paciente ${idPatient}`,
    )
    .replaceAll(
      "{{dtnascimento_paciente}}",
      formatDate(prescriptionData?.birthdate) ?? "Não informado",
    )
    .replaceAll("{{peso_paciente}}", weight ? `${weight} Kg` : "Não informado")
    .replaceAll(
      "{{altura_paciente}}",
      height ? `${height} cm` : "Não informado",
    )
    .replaceAll("{{idade_paciente}}", age != null ? `${age}` : "Não informado")
    .replaceAll(
      "{{assinatura}}",
      userSignature ?? "Assinatura não configurada",
    );
};
