import * as patientCache from "utils/patientCache";

export interface TrainingPatient {
  idPatient: number;
  name: string;
  birthdate: string;
  gender: "M" | "F";
  weight: number;
  height: number;
}

/**
 * Ids live in a reserved 99xxxx range so training records can never collide
 * with real ones, and the names make it obvious the data is fake.
 */
export const TRAINING_PATIENTS: TrainingPatient[] = [
  {
    idPatient: 990001,
    name: "Paciente Treinamento 1",
    birthdate: "1948-03-12T00:00:00",
    gender: "F",
    weight: 58,
    height: 160,
  },
  {
    idPatient: 990002,
    name: "Paciente Treinamento 2",
    birthdate: "1965-07-25T00:00:00",
    gender: "M",
    weight: 82,
    height: 178,
  },
  {
    idPatient: 990003,
    name: "Paciente Treinamento 3",
    birthdate: "1980-05-10T00:00:00",
    gender: "M",
    weight: 70,
    height: 170,
  },
  {
    idPatient: 990004,
    name: "Paciente Treinamento 4",
    birthdate: "1992-11-02T00:00:00",
    gender: "F",
    weight: 64,
    height: 165,
  },
  {
    idPatient: 990005,
    name: "Paciente Treinamento 5",
    birthdate: "2001-01-18T00:00:00",
    gender: "M",
    weight: 75,
    height: 182,
  },
];

/**
 * Patient names are resolved through patientCache (services/hospital.js), not
 * through the main axios instance. Entries seeded with cache=true are never
 * requested from the network, so this fully isolates name resolution during
 * training. Leftover entries after training are inert: real records never use
 * the 99xxxx id range.
 */
export const seedTrainingPatients = (): void => {
  const entries: patientCache.Cache = {};
  TRAINING_PATIENTS.forEach((patient) => {
    entries[String(patient.idPatient)] = {
      idPatient: patient.idPatient,
      name: patient.name,
      status: "success",
      cache: true,
    };
  });
  patientCache.setPatients(entries);
};
