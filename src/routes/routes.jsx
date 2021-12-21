/**
 * Auth verification
 */
import withAuth from '@lib/withAuth';
import chooseJourney from '@lib/chooseJourney';

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
import UserConfig from '@pages/UserConfig';
import Password from '@pages/Password';
import Conciliation from '@pages/Conciliation';
import UserAdmin from '@pages/UserAdmin';

const routes = [
  {
    exact: true,
    path: '/logout',
    component: withAuth({
      component: Logout,
      isLogoutPage: true
    })
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
    path: '/reset/:token',
    component: withAuth({
      component: Password,
      isLogoutPage: true
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
      component: chooseJourney()
    })
  },
  {
    exact: true,
    path: '/priorizacao/prescricoes',
    component: withAuth({
      component: ScreeningList,
      prioritizationType: 'prescription'
    })
  },
  {
    exact: true,
    path: '/priorizacao/pacientes',
    component: withAuth({
      component: ScreeningList,
      prioritizationType: 'patient'
    })
  },
  {
    exact: true,
    path: '/priorizacao/conciliacoes',
    component: withAuth({
      component: ScreeningList,
      prioritizationType: 'conciliation'
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
    path: '/conciliacao/:id',
    component: withAuth({
      component: Conciliation
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
    path: '/exames',
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
    path: '/exames/:idSegment/:slug',
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
    path: '/medicamentos/:idSegment',
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
    path: '/configuracoes/usuario',
    component: withAuth({
      component: UserConfig
    })
  },
  {
    exact: true,
    path: '/configuracoes/administracao',
    component: withAuth({
      component: UserAdmin
    })
  },
  {
    exact: true,
    path: '/priorizacao/pacientes/:startDate',
    component: withAuth({
      component: ScreeningList,
      prioritizationType: 'patient'
    })
  },
  {
    exact: true,
    path: '/priorizacao/prescricoes/:startDate',
    component: withAuth({
      component: ScreeningList,
      prioritizationType: 'prescription'
    })
  },
  {
    exact: true,
    path: '/priorizacao/conciliacoes/:startDate',
    component: withAuth({
      component: ScreeningList,
      prioritizationType: 'conciliation'
    })
  }
];

export default routes;
