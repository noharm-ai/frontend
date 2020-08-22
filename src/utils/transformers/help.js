export const routeToId = path => {
  switch (path) {
    case '/':
      return 'triagem';
    case '/:startDate':
      return 'triagem';
    case '/prescricao/:slug':
      return 'prescricao';
    case '/medicamentos/:idSegment/:idDrug/:slug':
      return 'medicamentos';
    case '/relatorios/visualizar':
      return 'relatorios';
    case '/segmentos/:idSegment/:slug':
      return 'segmentos';
    case '/base-de-conhecimento/:uid':
      return 'base-de-conhecimento';
    default:
      return path.replace('/', '');
  }
};
