import { format } from 'date-fns';

import { stringify, formatAge } from './utils';
import { uniqBy } from '@utils/lodash';

export const transformDrug = ({ dose, measureUnit, route, ...drug }) => ({
  ...drug,
  dose,
  measureUnit,
  dosage: `${dose} ${measureUnit.value}`,
  route
});

export const transformPrescription = ({
  daysAgo,
  prescriptionScore,
  date,
  expire,
  birthdate,
  mdrd,
  tgo,
  tgp,
  patientScore,
  prescription,
  solution,
  procedures,
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
  dateFormated: format(new Date(date), 'dd/MM/yyyy HH:mm'),
  expire,
  expireFormated: expire ? format(new Date(expire), 'dd/MM/yyyy HH:mm') : '',
  shortDateFormat: format(new Date(date), 'dd/MM'),
  birthdate,
  age: birthdate ? formatAge(birthdate) : '',
  mdrd,
  tgo,
  tgp,
  patientScore,
  patientRisk: stringify([mdrd, tgo, tgp, patientScore], ' 0 '),
  prescription: prescription ? prescription.map(transformDrug) : [],
  solution: solution ? solution.map(transformDrug) : [],
  procedures: procedures ? procedures.map(transformDrug) : [],
  namePatient,
  idPrescription,
  slug: idPrescription
});

export const transformPrescriptions = prescriptions => prescriptions.map(transformPrescription);

export const getUniqueDrugs = (prescriptions, solutions, procedures) => {
  const drugs = [];
  const add = ({ idDrug, drug }) => drugs.push({ idDrug, name: drug });

  if (prescriptions) prescriptions.forEach(item => add(item));
  if (solutions) solutions.forEach(item => add(item));
  if (procedures) procedures.forEach(item => add(item));

  return uniqBy(drugs, 'idDrug').sort((a, b) => {
    if (a.drug > b.drug) return 1;
    if (a.drug < b.drug) return -1;
    return 0;
  });
};

export const transformExams = exams =>
  Object.keys(exams).map(key => {
    const obj = exams[key];
    return { ...obj, key };
  });
