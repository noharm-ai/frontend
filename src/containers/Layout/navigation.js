export default [
  {
    key: '/',
    text: 'Priorização de Prescrições',
    icon: 'drugPrescription',
    id: 'gtm-lnk-pacientes-triagem'
  },
  {
    key: '/intervencoes',
    text: 'Intervenções',
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
        key: '/medicamentos',
        text: 'Medicamentos',
        icon: 'drug',
        id: 'gtm-lnk-medicamentos'
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
