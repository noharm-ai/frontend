import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";

/**
 * The variables a clinical note text takes, resolved by getCustomClinicalNote
 * (components/Forms/ClinicalNotes/util/customTemplate.js) when the text is
 * loaded for a prescription. Shared by the saved texts modal and the custom
 * text of the evolution forms, so both offer the same list.
 *
 * Items are antd Dropdown menu items: the key is the variable itself, except
 * for the ones that open a picker first (custom_substance, custom_class).
 */
export interface VariableMenuItem {
  // a submenu needs no key, only its items
  key?: string;
  label: string;
  children?: VariableMenuItem[];
}

export interface ClinicalNoteVariableMenus {
  patientVariables: VariableMenuItem[];
  examVariables: VariableMenuItem[];
  drugVariables: VariableMenuItem[];
  conciliaVariables: VariableMenuItem[];
  interventionVariables: VariableMenuItem[];
  alertVariables: VariableMenuItem[];
  utilsVariables: VariableMenuItem[];
}

// the variables whose name carries a parameter after the dot
// (e.g. {{substancias.1_2}}, {{exame_unico.cr}}, {{alerta_tipo.dm}})
export const PARAMETRIZED_VARIABLE_PREFIXES = [
  "substancias",
  "classes",
  "exame_unico",
  "alerta_tipo",
  "alerta_nivel",
  "interacoes",
];

export const getClinicalNoteVariableMenus = (
  t: (key: string) => string,
  exams?: { key: string; value: { initials: string } }[] | null,
): ClinicalNoteVariableMenus => {
  const patientVariables = [
    {
      label: "Alergias",
      key: "{{alergias}}",
    },
    {
      label: "Altura",
      key: "{{altura_paciente}}",
    },
    {
      label: "Nome",
      key: "{{nome_paciente}}",
    },
    {
      label: "Dados (NoHarm Care)",
      key: "{{dados_nhcare}}",
    },
    {
      label: "Idade",
      key: "{{idade_paciente}}",
    },
    {
      label: "Peso",
      key: "{{peso_paciente}}",
    },

    {
      label: "IMC",
      key: "{{imc_paciente}}",
    },
    {
      label: "Superfície Corporal",
      key: "{{superficie_corporal_paciente}}",
    },

    {
      label: "Escore Global",
      key: "{{escore_global}}",
    },
    {
      label: "Risco do Paciente",
      key: "{{risco_paciente}}",
    },
    {
      label: "Sinais (NoHarm Care)",
      key: "{{sinais_nhcare}}",
    },
    {
      label: "Data de nascimento",
      key: "{{dtnascimento_paciente}}",
    },
    {
      label: "Número do atendimento",
      key: "{{nratendimento_paciente}}",
    },
    {
      label: "Data de internação",
      key: "{{data_internacao}}",
    },
    {
      label: "Setor",
      key: "{{setor}}",
    },
    {
      label: "Setor anterior",
      key: "{{setor_anterior}}",
    },
    {
      label: "CID (Quando integrado)",
      key: "{{paciente_cid}}",
    },
    {
      label: "Médico responsável (Quando integrado)",
      key: "{{paciente_medresponsavel}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const examVariables: VariableMenuItem[] = [
    {
      label: "20 Principais (card de exames)",
      children: [
        { key: "{{exames}}", label: "Todos" },
        { key: "{{exames_alterados}}", label: "Exames alterados" },
      ],
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  if (exams) {
    examVariables.push({
      label: "Por tipo",
      children: exams.map((e) => ({
        label: e.value.initials,
        key: `{{exame_unico.${e.key}}}`,
      })),
    });
  }

  const drugVariables = [
    {
      label: "Por atributo",
      children: [
        {
          label: "Antimicrobianos",
          key: "{{antimicrobianos}}",
        },
        {
          label: "Alta Vigilância",
          key: "{{alta_vigilancia}}",
        },
        {
          label: "Controlados",
          key: "{{controlados}}",
        },
        {
          label: "Dialisáveis",
          key: "{{dialisaveis}}",
        },
        {
          label: "MPI",
          key: "{{mpi}}",
        },
        {
          label: "Não padronizados",
          key: "{{nao_padronizados}}",
        },
        {
          label: "Quimioterápico",
          key: "{{quimioterapico}}",
        },
        {
          label: "Risco de queda",
          key: "{{med_risco_queda}}",
        },
        {
          label: "Risco na gestação: D",
          key: "{{med_risco_gestacao_d}}",
        },
        {
          label: "Risco na gestação: X",
          key: "{{med_risco_gestacao_x}}",
        },
        {
          label: "Risco na lactação: Médio",
          key: "{{med_risco_lactacao_medio}}",
        },
        {
          label: "Risco na lactação: Alto",
          key: "{{med_risco_lactacao_alto}}",
        },
      ],
    },
    {
      label: "Por classe",
      children: [
        {
          label: "Customizada",
          key: "custom_class",
        },
        {
          label: "Analgésicos",
          key: "{{analgesicos}}",
        },
        {
          label: "Anestésicos Gerais",
          key: "{{anestesicos_gerais}}",
        },
        {
          label: "Antitrombóticos",
          key: "{{antitromboticos}}",
        },
        {
          label: "Profilaxia de Úlcera de Estresse",
          key: "{{profilaxia_ulcera_estresse}}",
        },
        {
          label: "Profilaxia Ocular",
          key: "{{profilaxia_ocular}}",
        },
        {
          label: "Vasopressores e Inotrópicos",
          key: "{{vasopressores_inotropicos}}",
        },
      ],
    },
    {
      label: "Por substância",
      key: "custom_substance",
    },
  ];

  const conciliaVariables = [
    {
      label: "Medicamentos Conciliados",
      key: "{{medicamentos_conciliados}}",
    },
    {
      label: "Medicamentos Não Conciliados",
      key: "{{medicamentos_nao_conciliados}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const interventionVariables = [
    {
      label: "Todas",
      key: "{{intervencoes}}",
    },
    {
      label: "Minhas intervenções",
      key: "{{minhas_intervencoes}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const alertVariables: VariableMenuItem[] = [
    {
      label: "Todos",
      key: "{{alertas}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  // alertVariables.push({
  //   label: "Interações",
  //   children: [
  //     { key: "{{interacoes}}", label: "Todos os níveis" },
  //     { key: "{{interacoes.nivel.baixo}}", label: "Nível baixo" },
  //     { key: "{{interacoes.nivel.medio}}", label: "Nível médio" },
  //     { key: "{{interacoes.nivel.alto}}", label: "Nível alto" },
  //   ],
  // });

  alertVariables.push({
    label: "Por nível",
    children: [
      {
        key: `{{alerta_nivel.low}}`,
        label: "Nível baixo",
      },
      {
        key: `{{alerta_nivel.medium}}`,
        label: "Nível médio",
      },
      {
        key: `{{alerta_nivel.high}}`,
        label: "Nível alto",
      },
    ],
  });

  alertVariables.push({
    label: "Por tipo",
    children: DrugAlertTypeEnum.getAlertTypes(t).map((a) => ({
      key: `{{alerta_tipo.${a.id}}}`,
      label: a.label,
    })),
  });

  const utilsVariables = [
    {
      label: "Assinatura",
      key: "{{assinatura}}",
    },
    {
      label: "Data Atual",
      key: "{{data_atual}}",
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  return {
    patientVariables,
    examVariables,
    drugVariables,
    conciliaVariables,
    interventionVariables,
    alertVariables,
    utilsVariables,
  };
};

/** Flattens a variable menu into its leaf items (the insertable variables). */
export const flattenVariableMenu = (
  items: VariableMenuItem[],
): VariableMenuItem[] =>
  items.flatMap((item) =>
    item.children ? flattenVariableMenu(item.children) : [item],
  );
