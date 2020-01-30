/**
 * Auth verification
 */
import withAuth from '@lib/withAuth';

/**
 * Pages
 */
import Login from '@pages/Login';
import ScreeningList from '@pages/ScreeningList';
import Screening from '@pages/Screening';
import Segments from '@pages/Segments';
import NewSegment from '@pages/Segments/NewSegment';
import EditSegment from '@pages/Segments/EditSegment';
import References from '@pages/References';
import Reports from '@pages/Reports';

const routes = [
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
    path: '/',
    component: withAuth({
      component: ScreeningList
    })
  },
  {
    exact: true,
    path: '/triagem/:slug',
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
    path: '/segmentos/novo',
    component: withAuth({
      component: NewSegment
    })
  },
  {
    exact: true,
    path: '/segmentos/editar/:slug',
    component: withAuth({
      component: EditSegment
    })
  },
  {
    exact: true,
    path: '/tabela-referencia',
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
  }
];

export default routes;
