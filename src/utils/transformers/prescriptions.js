import { format } from "date-fns";

import { uniqBy } from "utils/lodash";
import moment from "moment";
import {
  groupSolutions,
  filterWhitelistedChildren,
  getWhitelistedChildren,
  groupComponents,
} from "utils/transformers/prescriptionDrugs";
import { stringify, formatAge } from "./utils";
import { toDataSource } from "utils";

const fillConciliationRelatedDrugs = (list, conciliaList) => {
  list.forEach((item) => {
    let relation;

    if (conciliaList) {
      relation = conciliaList.find((d) => {
        return d.idDrug === item.idDrug;
      });
    }

    if (relation) {
      item.conciliaRelationId = relation.idPrescriptionDrug;
    } else {
      item.conciliaRelationId = null;
    }
  });
};

/**
 * group by Prescription
 * @param {*} list
 * @param {*} prescriptionType
 * @param {*} groupFunction
 * @param {*} extraContent
 */
const groupByPrescription = (
  list,
  prescriptionType,
  groupFunction,
  infusionList,
  extraContent
) => {
  if (extraContent && extraContent.concilia) {
    fillConciliationRelatedDrugs(list, extraContent.conciliaList);
  }

  const drugArray = [];
  list.forEach((item) => {
    if (!drugArray[item.idPrescription]) {
      drugArray[item.idPrescription] = [];
    }
    drugArray[item.idPrescription].push(item);
  });
  const dsArray = [];
  Object.keys(drugArray).forEach((idPrescription) => {
    const item = drugArray[idPrescription];
    if (groupFunction) {
      dsArray.push({
        key: idPrescription,
        value: groupFunction(
          toDataSource(item, "idPrescriptionDrug", {
            prescriptionType,
            ...extraContent,
          }),
          infusionList
        ),
      });
    } else {
      dsArray.push({
        key: idPrescription,
        value: toDataSource(item, "idPrescriptionDrug", {
          prescriptionType,
          ...extraContent,
        }),
      });
    }
  });
  return dsArray;
};

export const getUniqueDrugs = (prescriptions, solutions, procedures) => {
  const drugs = [];
  const add = ({ idDrug, drug }) => drugs.push({ idDrug, name: drug });

  if (prescriptions) prescriptions.forEach((item) => add(item));
  if (solutions) solutions.forEach((item) => add(item));
  if (procedures) procedures.forEach((item) => add(item));

  return uniqBy(drugs, "idDrug").sort((a, b) => {
    if (a.drug > b.drug) return 1;
    if (a.drug < b.drug) return -1;
    return 0;
  });
};

export const sourceToStoreType = (source) => {
  switch (source) {
    case "prescription":
    case "prescriptions":
    case "Medicamentos":
      return "prescription";

    case "solution":
    case "solutions":
    case "Soluções":
      return "solution";

    case "procedure":
    case "procedures":
    case "Procedimentos":
    case "Proced/Exames":
      return "procedure";

    case "diet":
    case "Diet":
    case "Dieta":
    case "Dietas":
      return "diet";

    case "intervention":
    case "interventions":
    case "Intervenções":
      return "intervention";

    case "patient":
      return "patient";

    default:
      console.error("undefined source", source);
      return null;
  }
};

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
  dischargeDate,
  infusion,
  interventions,
  globalScore,
  diet,
  admissionDate,
  ...item
}) => {
  const prescriptionList = prescription
    ? groupByPrescription(
        groupComponents(
          filterWhitelistedChildren(prescription.map(transformDrug))
        ),
        "prescriptions",
        null,
        null,
        {
          whitelistedChildren: getWhitelistedChildren(prescription),
          concilia: item.concilia,
          conciliaList: item.conciliaList,
        }
      )
    : [];

  const solutionList = solution
    ? groupByPrescription(
        solution.map(transformDrug),
        "solutions",
        groupSolutions,
        infusion
      )
    : [];
  const proceduresList = procedures
    ? groupByPrescription(
        groupComponents(procedures.map(transformDrug)),
        "procedures",
        null
      )
    : [];
  const dietList = diet
    ? groupByPrescription(
        filterWhitelistedChildren(diet.map(transformDrug)),
        "diet",
        null,
        null,
        {
          whitelistedChildren: getWhitelistedChildren(diet),
        }
      )
    : [];

  const countList = (list) => {
    let count = 0;

    Object.keys(list).forEach((i) => {
      count += list[i].value.filter(
        (item) => !(item.total || item.emptyRow)
      ).length;
    });

    return count;
  };

  return {
    ...item,
    daysAgo,
    daysAgoString: `${daysAgo} dia(s)`,
    prescriptionScore,
    globalScore,
    prescriptionRisk: stringify([prescriptionScore]),
    date,
    dateFormated: format(new Date(date), "dd/MM/yyyy HH:mm"),
    dateOnlyFormated: format(new Date(date), "dd/MM/yyyy"),
    expire,
    expireFormated: expire ? format(new Date(expire), "dd/MM/yyyy HH:mm") : "",
    admissionDate: admissionDate
      ? format(new Date(admissionDate), "dd/MM/yyyy HH:mm")
      : "",
    dischargeFormated: dischargeDate
      ? format(new Date(dischargeDate), "dd/MM/yyyy HH:mm")
      : "",
    shortDateFormat: format(new Date(date), "dd/MM"),
    birthdate,
    age: birthdate ? formatAge(birthdate) : "",
    birthdays: birthdate ? moment().diff(birthdate, "day") : "",
    mdrd,
    tgo,
    tgp,
    patientScore,
    patientRisk: stringify([mdrd, tgo, tgp, patientScore], " 0 "),
    prescription: prescriptionList,
    solution: solutionList,
    procedures: proceduresList,
    diet: dietList,
    interventions,
    namePatient,
    idPrescription,
    slug: idPrescription,
    infusion,
    prescriptionRaw: prescription,
    solutionRaw: solution,
    proceduresRaw: procedures,
    interventionsRaw: interventions,
    dietRaw: diet,
    prescriptionCount: countList(prescriptionList),
    solutionCount: countList(solutionList),
    proceduresCount: countList(proceduresList),
    dietCount: countList(dietList),
    uniqueDrugs: getUniqueDrugs(prescription, solution, procedures),
  };
};

export const transformPrescriptions = (prescriptions) =>
  prescriptions.map(transformPrescription);

export const transformExams = (exams) =>
  Object.keys(exams).map((key) => {
    const obj = exams[key];
    return { ...obj, key };
  });

export const transformDrug = ({
  dose,
  measureUnit,
  route,
  source,
  ...drug
}) => ({
  ...drug,
  dose,
  measureUnit,
  dosage: `${dose ? dose.toLocaleString("pt-BR") : ""} ${measureUnit.value}`,
  route,
  source: sourceToStoreType(source),
});

export const translateDialysis = (dialysis) => {
  switch (dialysis) {
    case "c":
      return "Contínua";
    case "x":
      return "Estendida";
    case "v":
      return "Convencional";
    case "p":
      return "Peritoneal";
    case "0":
      return "Não realiza";
    default:
      return "Não informado";
  }
};
