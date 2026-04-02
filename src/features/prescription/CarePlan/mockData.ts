export interface SnippetItem {
  title: string;
  text: string;
}

export interface SnippetCategory {
  category: string;
  items: SnippetItem[];
}

export interface Template {
  title: string;
  description: string;
  content: string;
}

export const BASE_TEMPLATES: Template[] = [
  {
    title: "Consulta Farmacêutica",
    description: "Modelo padrão para consulta farmacêutica",
    content:
      "<p><strong>Orientações - Plano de cuidado:</strong></p>" +
      "<p>Nome do Paciente: </p>" +
      "<p>Data de nascimento: </p>" +
      "<p>Data da consulta: </p>" +
      "<p></p>" +
      "<p><strong>1) Oriento Uso correto dos medicamentos:</strong></p>" +
      "<p></p>" +
      "<p><strong>2) Oriento uso correto dos insumos de DM::</strong></p>" +
      "<p></p>",
  },
  {
    title: "Alta Hospitalar",
    description: "Orientações ao paciente na saída do hospital",
    content:
      "<p><strong>Orientações de Alta Hospitalar:</strong></p>" +
      "<p>Nome do Paciente: </p>" +
      "<p>Data de alta: </p>" +
      "<p></p>",
  },
  {
    title: "Acompanhamento Ambulatorial",
    description: "Plano para retorno em consulta ambulatorial",
    content:
      "<p><strong>Plano de Cuidado - Consulta de Retorno:</strong></p>" +
      "<p>Paciente: </p>" +
      "<p>Data: </p>" +
      "<p></p>",
  },
  {
    title: "Monitoramento Crônico",
    description: "Acompanhamento de paciente com doença crônica",
    content:
      "<p><strong>Plano de Cuidado - Doença Crônica:</strong></p>" +
      "<p>Paciente: </p>" +
      "<p>Diagnóstico principal: </p>" +
      "<p>Medicamentos em uso: </p>" +
      "<p></p>",
  },
];

export const BASE_TEMPLATE = BASE_TEMPLATES[0].content;

export const SNIPPET_CATEGORIES: SnippetCategory[] = [
  {
    category: "Uso de Medicamentos",
    items: [
      {
        title: "Uso correto dos medicamentos",
        text: "☐ Utilize seus medicamentos conforme prescrição médica.\n",
      },
      {
        title: "Lembrete de horário",
        text: "☐ Lembrar de tomar [nome do medicamento] sempre nos horários [horários] 8/8h, às 7h da manhã - 15h da manhã - 23h.\n",
      },
      {
        title: "Caneta de insulina",
        text: `☐ Uso correto da caneta de insulina:
1 - Lave e seque as mãos. Separe a caneta com o medicamento, a agulha e o álcool 70%.
2 - Deixe homogênea a insulina, de aspecto leitoso, movimentando levemente a caneta, por no mínimo 20 vezes, para garantir ação correta da insulina.
3 - Limpe com álcool 70% o local que será acoplada a agulha e espere secar.
4 - Remova o lacre da agulha para acoplá-la na caneta.
5 - Rosqueie a agulha na caneta, em um ângulo reto. Selecione a dose prescrita e retire os protetores externo e interno.
6 - Passe o álcool 70% com um movimento único no local escolhido para a aplicação e espere secar.
7 - Faça a prega subcutânea, se indicado. Introduza a agulha, injete o medicamento e aguarde no mínimo 10 segundos com a agulha no subcutâneo para que toda insulina registrada seja injetada.
8 - Após a aplicação, remova imediatamente a agulha da caneta, utilizando o protetor externo da agulha.
9 - Descarte a agulha em um coletor para perfurocortantes ou recipientes com paredes rígidas, boca larga e tampa. Entregue no posto de saúde mais próximo.
`,
      },
      {
        title: "Não interromper o tratamento",
        text: "☐ Não interrompa o uso dos medicamentos sem orientação médica, mesmo que se sinta bem.\n",
      },
      {
        title: "Armazenamento correto",
        text: "☐ Guarde os medicamentos em local seco, arejado e protegido da luz solar e do alcance de crianças.\n",
      },
    ],
  },
  {
    category: "Dieta e Nutrição",
    items: [
      {
        title: "Restrição de sódio",
        text: "☐ Reduza o consumo de sal e alimentos industrializados (embutidos, enlatados, temperos prontos).\n",
      },
      {
        title: "Hidratação",
        text: "☐ Beba pelo menos 2 litros de água por dia, salvo orientação contrária do médico.\n",
      },
      {
        title: "Controle de açúcar",
        text: "☐ Evite alimentos ricos em açúcar simples (doces, refrigerantes, sucos industrializados).\n",
      },
      {
        title: "Dieta para anticoagulação",
        text: "☐ Mantenha uma dieta equilibrada e evite grandes variações no consumo de alimentos ricos em vitamina K (folhas verdes escuras como espinafre, brócolis, couve).\n",
      },
    ],
  },
  {
    category: "Atividade Física",
    items: [
      {
        title: "Atividade física moderada",
        text: "☐ Realize atividade física leve a moderada (caminhada, hidroginástica) por pelo menos 30 minutos, 5 vezes por semana, conforme tolerância.\n",
      },
      {
        title: "Restrição de esforço",
        text: "☐ Evite esforços físicos intensos até nova avaliação médica.\n",
      },
      {
        title: "Repouso relativo",
        text: "☐ Mantenha repouso relativo, evitando atividades que causem cansaço excessivo ou falta de ar.\n",
      },
    ],
  },
  {
    category: "Monitoramento",
    items: [
      {
        title: "Aferição de pressão arterial",
        text: "☐ Afira a pressão arterial [frequência] e anote os valores para trazer nas consultas.\n",
      },
      {
        title: "Monitoramento da glicemia",
        text: "☐ Monitore a glicemia capilar conforme orientação médica e anote os valores (em jejum, pré e pós-prandial).\n",
      },
      {
        title: "Controle de peso",
        text: "☐ Pese-se semanalmente, sempre no mesmo horário e nas mesmas condições. Informe ao médico se houver variação maior que 2 kg em poucos dias.\n",
      },
      {
        title: "Sinais de alerta",
        text: "☐ Procure atendimento imediato se apresentar: dor no peito, falta de ar intensa, desmaio, confusão mental ou piora súbita dos sintomas.\n",
      },
    ],
  },
  {
    category: "Retorno e Acompanhamento",
    items: [
      {
        title: "Retorno agendado",
        text: "☐ Compareça à consulta de retorno agendada para [data/local].\n",
      },
      {
        title: "Exames solicitados",
        text: "☐ Realize os exames solicitados antes do próximo retorno e traga os resultados na consulta.\n",
      },
      {
        title: "Dúvidas",
        text: "☐ Em caso de dúvidas, entre em contato pelo telefone [telefone] ou retorne ao serviço de saúde.\n",
      },
    ],
  },
];
