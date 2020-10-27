export default [
  {
    key: 'prioritization',
    text: 'menu.prioritization',
    icon: 'table',
    id: 'gtm-lnk-priorizacao',
    children: [
      {
        key: '/priorizacao/prescricoes',
        text: 'menu.prioritization-prescription',
        icon: 'drugPrescription',
        id: 'gtm-lnk-priorizacao-prescricao'
      },
      {
        key: '/priorizacao/pacientes',
        text: 'menu.prioritization-patient',
        icon: 'user',
        id: 'gtm-lnk-priorizacao-paciente'
      }
    ]
  },
  {
    key: '/intervencoes',
    text: 'menu.interventions',
    icon: 'warning',
    id: 'gtm-lnk-intervencoes'
  },
  {
    key: '/relatorios',
    text: 'menu.reports',
    icon: 'report',
    id: 'gtm-lnk-report'
  },
  {
    key: { pathname: 'https://noharm.octadesk.com/kb' },
    text: 'menu.knowledgeBase',
    icon: 'bulb',
    id: 'gtm-lnk-knowledgeBase'
  },
  {
    key: 'config',
    text: 'menu.config',
    icon: 'setting',
    id: 'gtm-lnk-config',
    children: [
      {
        key: '/medicamentos',
        text: 'menu.medications',
        icon: 'drug',
        id: 'gtm-lnk-medicamentos'
      },
      {
        key: '/segmentos',
        text: 'menu.segments',
        icon: 'medicine-box',
        id: 'gtm-lnk-segmentos'
      }
    ]
  }
];
