export default [
  {
    key: '/',
    text: 'Pacientes para Triagem',
    icon: 'user',
    id: 'gtm-lnk-pacientes-triagem'
  },
  {
    key: '/intervencoes',
    text: 'Intervenções Pendentes',
    icon: 'warning',
    id: 'gtm-lnk-intervencoes'
  },
  {
    key: '/relatorios',
    text: 'Relatórios',
    icon: 'report',
    id: 'gtm-lnk-report'
  },
  {
    key: 'config',
    text: 'Configurações',
    icon: 'setting',
    id: 'gtm-lnk-config',
    children: [
      {
        key: '/tabela-referencia',
        text: 'Tabela de Referências',
        icon: 'table',
        id: 'gtm-lnk-tabela-referencias'
      },
      {
        key: '/segmentos',
        text: 'Segmentos',
        icon: 'medicine-box',
        id: 'gtm-lnk-segmentos'
      }
    ]
  }
];
