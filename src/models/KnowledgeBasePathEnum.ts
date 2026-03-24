export class KnowledgeBasePathEnum {
  static getList = () => [
    {
      value: "Cadastro de Usuários",
      label: "Cadastro de Usuários",
      pathPattern: /^\/configuracoes\/administracao/,
    },
    {
      value: "Central de Ajuda",
      label: "Central de Ajuda",
      pathPattern: /^\/suporte/,
    },
    {
      value: "Conciliação",
      label: "Conciliação",
      pathPattern: /^\/conciliacao\//,
    },
    {
      value: "Configuração de Exames",
      label: "Configuração de Exames",
      pathPattern: /^\/admin\/exames/,
    },
    {
      value: "Configuração de Marcadores",
      label: "Configuração de Marcadores",
    },
    {
      value: "Configuração do Usuário",
      label: "Configuração do Usuário",
      pathPattern: /^\/configuracoes\/usuario/,
    },
    {
      value: "Intervenções",
      label: "Intervenções",
      pathPattern: /^\/intervencoes/,
    },
    { value: "Paciente-Dia", label: "Paciente-Dia" },
    {
      value: "Pacientes",
      label: "Pacientes",
      pathPattern: /^\/pacientes/,
    },
    {
      value: "Painel de Medicamentos",
      label: "Painel de Medicamentos",
      pathPattern: /^\/painel-medicamentos/,
    },
    {
      value: "Prescrição",
      label: "Prescrição",
      pathPattern: /^\/prescricao\//,
    },
    {
      value: "Priorização de Conciliações",
      label: "Priorização de Conciliações",
      pathPattern: /^\/priorizacao\/conciliacoes/,
    },
    {
      value: "Priorização por Pacientes (cards)",
      label: "Priorização por Pacientes (cards)",
      pathPattern: /^\/priorizacao\/pacientes\/cards/,
    },
    {
      value: "Priorização por Pacientes (tabela)",
      label: "Priorização por Pacientes (tabela)",
      pathPattern: /^\/priorizacao\/pacientes/,
    },
    {
      value: "Priorização por Prescrições",
      label: "Priorização por Prescrições",
      pathPattern: /^\/priorizacao\/prescricoes/,
    },
    {
      value: "Relatórios",
      label: "Relatórios",
      pathPattern: /^\/relatorios/,
    },
    {
      value: "Relatórios Customizados",
      label: "Relatórios Customizados",
      pathPattern: /^\/relatorios\/arquivo/,
    },
    {
      value: "Relatório: Paciente-Dia",
      label: "Relatório: Paciente-Dia",
      pathPattern: /^\/relatorios\/pacientes-dia/,
    },
    {
      value: "Relatório: Prescrições",
      label: "Relatório: Prescrições",
      pathPattern: /^\/relatorios\/prescricoes/,
    },
    {
      value: "Relatório: Intervenções",
      label: "Relatório: Intervenções",
      pathPattern: /^\/relatorios\/intervencoes/,
    },
    {
      value: "Relatório: Auditoria",
      label: "Relatório: Auditoria",
      pathPattern: /^\/relatorios\/audit/,
    },
    {
      value: "Relatório: Farmacoeconomia",
      label: "Relatório: Farmacoeconomia",
      pathPattern: /^\/relatorios\/economia/,
    },
    {
      value: "Sumário de Alta",
      label: "Sumário de Alta",
      pathPattern: /^\/sumario-alta/,
    },
  ];

  static getPath = (pathname: string): string => {
    const match = KnowledgeBasePathEnum.getList().find((item) =>
      item.pathPattern?.test(pathname),
    );
    return match?.value ?? "GERAL";
  };
}
