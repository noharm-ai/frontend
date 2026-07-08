import { TrackedPrescriptionPrioritizationAction } from "utils/tracker";
import { TRAINING_SEGMENT_ADULT_ID } from "../mock/fixtures/segments";
import { setTrainingFilter } from "../TrainingSlice";
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
      id: "page-tour",
      title: {
        pt: "Conheça a tela",
        en: "Get to know the page",
      },
      instruction: {
        pt: "Vamos fazer um tour rápido pelos principais elementos da tela. Use os botões do tour para avançar.",
        en: "Let's take a quick tour of the page's main elements. Use the tour's buttons to move forward.",
      },
      completeOn: { type: "tour" },
      tour: [
        {
          title: {
            pt: "Priorização por Pacientes",
            en: "Patient Prioritization",
          },
          description: {
            pt: "A tela de priorização por pacientes auxilia na priorização dos pacientes.",
            en: "The patient prioritization screen helps prioritize patients that need clinical attention.",
          },
          target: ".page-title",
        },
        {
          title: {
            pt: "Filtros",
            en: "Filters",
          },
          description: {
            pt: "Aqui você define os filtros para buscar os pacientes.",
            en: "Here you set the criteria used to load and sort the patient list.",
          },
          target: ".filter-card",
        },
        {
          title: {
            pt: "Mais filtros",
            en: "More filters",
          },
          description: {
            pt: "Clicando em Ver mais você tem acesso a mais filtros para refinar sua busca.",
            en: "By clicking More filters you can access more filters to refine your search.",
          },
          target: ".gtm-btn-adv-search",
        },
        {
          title: {
            pt: "Salvar filtros",
            en: "Save filters",
          },
          description: {
            pt: "Selecione os filtros desejados e clique em Salvar filtros para aplicar. Ou carregue uma filtragem salva anteriormente.",
            en: "Select the desired filters and click Save filters to apply. Or load previously saved filtering.",
          },
          target: ".memory-filters",
        },
        {
          title: {
            pt: "Priorizar por",
            en: "Priorizar por",
          },
          description: {
            pt: "Escolha o critério de prioridade clínica usado para ordenar os pacientes.",
            en: "Choose the clinical priority criteria used to sort patients.",
          },
          target: ".prioritization-select",
        },
        {
          title: {
            pt: "Busca local",
            en: "Local search",
          },
          description: {
            pt: "Busca pelo nome do paciente ou número de atendimento. Esta busca é aplicada somente aos pacientes desta busca limitada em 500 registros.",
            en: "Search for a patient by name or admission number. This search applies only to the patients returned by the current filter, up to a maximum of 500 results.",
          },
          target: ".search-input",
        },
        {
          title: {
            pt: "Lista de pacientes",
            en: "Patient list",
          },
          description: {
            pt: "Cada cartão representa a visão de um paciente em um dia. As abas mostram mais indicadores, anotações e marcadores definidos para este paciente.",
            en: "Each card represents a patient on a given day. The tabs show additional indicators, notes, and markers defined for this patient.",
          },
          target: ".grid div",
        },
      ],
    },
    {
      id: "select-segment",
      title: {
        pt: "Filtre por segmento",
        en: "Filter by segment",
      },
      instruction: {
        pt: 'No campo "Segmento", selecione "Segmento Adulto" para definir quais pacientes serão listados.',
        en: 'In the "Segmento" field, select "Segmento Adulto" to define which patients will be listed.',
      },
      target: ".segment-select",
      completeOn: {
        type: "action",
        actionType: setTrainingFilter.type,
        when: (action) =>
          !!action.payload?.idSegment?.includes?.(TRAINING_SEGMENT_ADULT_ID),
      },
    },
    {
      id: "search-segment",
      title: {
        pt: "Busque os pacientes",
        en: "Search for patients",
      },
      instruction: {
        pt: "Agora clique no botão de busca (lupa) para carregar os pacientes do segmento selecionado.",
        en: "Now click the search (magnifier) button to load the patients from the selected segment.",
      },
      target: ".gtm-btn-search",
      completeOn: {
        type: "action",
        actionType: "PRESCRIPTIONS_FETCH_LIST_SUCCESS",
      },
    },
    {
      id: "change-order",
      title: {
        pt: "Altere a ordem da lista",
        en: "Change the list order",
      },
      instruction: {
        pt: 'A lista é ordenada pelo critério escolhido em "Priorizar por". Clique no botão de seta ao lado dele para inverter a ordem dos pacientes.',
        en: 'The list is sorted by the criteria chosen in "Priorizar por". Click the arrow button next to it to reverse the patient order.',
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
        pt: 'No campo "Situação", selecione "Pendentes" para ver apenas os pacientes que ainda não foram checados.',
        en: 'In the "Situação" field, select "Pendentes" to see only patients that have not been checked yet.',
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
        pt: 'Digite "Paciente Treinamento 1" (a busca é acionada a partir de 4 caracteres).',
        en: 'Type "Paciente Treinamento 1" (the search kicks in after 4 characters).',
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
