import { format, differenceInYears } from 'date-fns';

import { stringify, createSlug } from './utils';

export const transformDrug = ({ dose, measureUnit, route, ...drug }) => ({
  ...drug,
  dose,
  measureUnit,
  dosage: `${dose} ${measureUnit}`,
  route: stringify([route])
});

export const transformPrescription = ({
  daysAgo,
  prescriptionScore,
  date,
  birthdate,
  mdrd,
  tgo,
  tgp,
  patientScore,
  prescription,
  namePatient,
  idPrescription,
  ...item
}) => ({
  ...item,
  daysAgo,
  daysAgoString: `${daysAgo} dia(s)`,
  prescriptionScore,
  prescriptionRisk: stringify([prescriptionScore]),
  date,
  dateFormated: format(new Date(date), 'dd/MM/yyyy'),
  birthdate,
  age: differenceInYears(new Date(), new Date(birthdate)),
  mdrd,
  tgo,
  tgp,
  patientScore,
  patientRisk: stringify([mdrd, tgo, tgp, patientScore], ' 0 '),
  prescription: prescription ? prescription.map(transformDrug) : [],
  namePatient,
  idPrescription,
  slug: createSlug(namePatient, idPrescription)
});

export const transformPrescriptions = prescriptions => prescriptions.map(transformPrescription);
