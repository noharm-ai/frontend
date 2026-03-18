export function getKnowledgeBasePath(pathname: string): string {
  if (/^\/priorizacao\/prescricoes/.test(pathname))
    return "Priorização por Prescrições";
  if (/^\/priorizacao\/pacientes\/cards/.test(pathname))
    return "Priorização por Pacientes (cards)";
  if (/^\/priorizacao\/pacientes/.test(pathname))
    return "Priorização por Pacientes (tabela)";
  if (/^\/priorizacao\/conciliacoes/.test(pathname))
    return "Priorização de Conciliações";
  if (/^\/prescricao\//.test(pathname)) return "Prescrição";
  if (/^\/conciliacao\//.test(pathname)) return "Conciliação";
  if (/^\/pacientes/.test(pathname)) return "Pacientes";
  if (/^\/painel-medicamentos/.test(pathname)) return "Painel de Medicamentos";
  if (/^\/intervencoes/.test(pathname)) return "Intervenções";
  if (/^\/relatorios/.test(pathname)) return "Relatórios";
  if (/^\/sumario-alta/.test(pathname)) return "Sumário de Alta";
  if (/^\/suporte/.test(pathname)) return "Central de Ajuda";
  if (/^\/configuracoes\/usuario/.test(pathname))
    return "Configuração do Usuário";
  return "GERAL";
}
