import { TrackedPrescriptionPrioritizationAction } from "utils/tracker";
import type { Training } from "../types";

/**
 * First training: covers the basic interactions of the prioritization cards
 * page. Serves as the reference example for authoring new trainings — it
 * exercises every mechanism: informational steps, tracker-event conditions
 * (with and without payload predicates) and redux-action conditions.
 */
export const prioritizationBasics: Training = {
  id: "prioritization-basics",
  title: {
    pt: "Conhecendo a Priorização",
    en: "Getting to know Prioritization",
  },
  description: {
    pt: "Aprenda as interações básicas da tela de priorização por pacientes.",
    en: "Learn the basic interactions of the patient prioritization page.",
  },
  path: "/priorizacao/pacientes/cards",
  steps: [
    {
      id: "welcome",
      title: {
        pt: "Bem-vindo ao modo treinamento",
        en: "Welcome to training mode",
      },
      instruction: {
        pt: "Neste treinamento você vai conhecer a tela de priorização. Todos os pacientes exibidos são fictícios: nada do que você fizer aqui afeta dados reais. Clique em Próximo para começar.",
        en: "In this training you will get to know the prioritization page. Every patient shown is fictitious: nothing you do here affects real data. Click Next to begin.",
      },
    },
    {
      id: "change-order",
      title: {
        pt: "Altere a ordem da lista",
        en: "Change the list order",
      },
      instruction: {
        pt: "A lista é ordenada pelo critério escolhido em \"Priorizar por\". Clique no botão de seta ao lado dele para inverter a ordem dos pacientes.",
        en: "The list is sorted by the criteria chosen in \"Priorizar por\". Click the arrow button next to it to reverse the patient order.",
      },
      target: ".gtm-btn-change-order",
      completeOn: {
        type: "tracker",
        event: TrackedPrescriptionPrioritizationAction.CHANGE_ORDER,
      },
    },
    {
      id: "filter-pending",
      title: {
        pt: "Filtre as prescrições pendentes",
        en: "Filter pending prescriptions",
      },
      instruction: {
        pt: "No campo \"Situação\", selecione \"Pendentes\" para ver apenas os pacientes que ainda não foram checados.",
        en: "In the \"Situação\" field, select \"Pendentes\" to see only patients that have not been checked yet.",
      },
      target: ".prioritization-status-select",
      completeOn: {
        type: "tracker",
        event: TrackedPrescriptionPrioritizationAction.FILTER_STATUS,
        when: (details) => details.title === "0",
      },
    },
    {
      id: "search-patient",
      title: {
        pt: "Busque um paciente",
        en: "Search for a patient",
      },
      instruction: {
        pt: "Use o campo de busca para encontrar um paciente pelo nome ou número de atendimento.",
        en: "Use the search field to find a patient by name or admission number.",
      },
      hint: {
        pt: "Digite \"Paciente Treinamento 1\" (a busca é acionada a partir de 4 caracteres).",
        en: "Type \"Paciente Treinamento 1\" (the search kicks in after 4 characters).",
      },
      target: ".search-input",
      completeOn: {
        type: "tracker",
        event: TrackedPrescriptionPrioritizationAction.FILTER_KEYWORD,
      },
    },
    {
      id: "refresh-list",
      title: {
        pt: "Atualize a lista",
        en: "Refresh the list",
      },
      instruction: {
        pt: "Os filtros no topo da página controlam quais pacientes são carregados. Clique no botão de busca (lupa) para atualizar a lista.",
        en: "The filters at the top of the page control which patients are loaded. Click the search (magnifier) button to refresh the list.",
      },
      target: ".gtm-btn-search",
      completeOn: {
        type: "action",
        actionType: "PRESCRIPTIONS_FETCH_LIST_SUCCESS",
      },
    },
  ],
};
