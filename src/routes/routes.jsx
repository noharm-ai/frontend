/**
 * Auth verification
 */
import withAuth from '@lib/withAuth';

/**
 * Pages
 */
import Login from '@pages/Login';
import Logout from '@pages/Logout';
import ScreeningList from '@pages/ScreeningList';
import Screening from '@pages/Screening';
import Segments from '@pages/Segments';
import References from '@pages/References';
import Reports from '@pages/Reports';
import ViewReport from '@pages/Reports/ViewReport';
import InterventionList from '@pages/InterventionList';
import KnowledgeBase from '@pages/KnowledgeBase';
import KnowledgeBaseArticle from '@pages/KnowledgeBase/Article';

const routes = [
  {
    exact: true,
    path: '/logout',
    component: Logout
  },
  {
    exact: true,
    path: '/login',
    component: withAuth({
      component: Login,
      isLoginPage: true
    })
  },
  {
    exact: true,
    path: '/login/:language',
    component: withAuth({
      component: Login,
      isLoginPage: true
    })
  },
  {
    exact: true,
    path: '/',
    component: withAuth({
      component: ScreeningList
    })
  },
  {
    exact: true,
    path: '/prescricao/:slug',
    component: withAuth({
      component: Screening
    })
  },
  {
    exact: true,
    path: '/segmentos',
    component: withAuth({
      component: Segments
    })
  },
  {
    exact: true,
    path: '/segmentos/:idSegment/:slug',
    component: withAuth({
      component: Segments
    })
  },
  {
    exact: true,
    path: '/medicamentos',
    component: withAuth({
      component: References
    })
  },
  {
    exact: true,
    path: '/medicamentos/:idSegment/:idDrug/:slug',
    component: withAuth({
      component: References
    })
  },
  {
    exact: true,
    path: '/medicamentos/:idSegment/:idDrug/:slug/:dose/:frequency',
    component: withAuth({
      component: References
    })
  },
  {
    exact: true,
    path: '/relatorios',
    component: withAuth({
      component: Reports
    })
  },
  {
    exact: true,
    path: '/relatorios/visualizar',
    component: withAuth({
      component: ViewReport
    })
  },
  {
    exact: true,
    path: '/intervencoes',
    component: withAuth({
      component: InterventionList
    })
  },
  {
    exact: true,
    path: '/base-de-conhecimento',
    component: withAuth({
      component: KnowledgeBase
    })
  },
  {
    exact: true,
    path: '/base-de-conhecimento/:uid',
    component: withAuth({
      component: KnowledgeBaseArticle
    })
  },
  {
    exact: true,
    path: '/:startDate',
    component: withAuth({
      component: ScreeningList
    })
  }
];

export default routes;
