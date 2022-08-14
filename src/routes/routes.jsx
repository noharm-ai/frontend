/**
 * Auth verification
 */
import WithAuth from "lib/withAuth";
import chooseJourney from "lib/chooseJourney";

/**
 * Pages
 */
import Login from "pages/Login";
import Logout from "pages/Logout";
import ScreeningList from "pages/ScreeningList";
import Screening from "pages/Screening";
import Segments from "pages/Segments";
import References from "pages/References";
import Reports from "pages/Reports";
import ViewReport from "pages/Reports/ViewReport";
import InterventionList from "pages/InterventionList";
import UserConfig from "pages/UserConfig";
// import Password from "pages/Password";
// import Conciliation from "pages/Conciliation";
import UserAdmin from "pages/UserAdmin";
import PatientList from "pages/PatientList";

const routes = [
  {
    exact: true,
    path: "/logout",
    element: <WithAuth component={Logout} isLogoutPage={true} />,
  },
  {
    exact: true,
    path: "/login",
    element: <WithAuth component={Login} isLoginPage={true} />,
  },
  // {
  //   exact: true,
  //   path: "/reset/:token",
  //   element: withAuth({
  //     component: Password,
  //     isLogoutPage: true,
  //   }),
  // },
  {
    exact: true,
    path: "/login/:language",
    element: <WithAuth component={Login} isLoginPage={true} />,
  },
  {
    exact: true,
    path: "/",
    element: <WithAuth component={chooseJourney()} />,
  },
  {
    exact: true,
    path: "/priorizacao/prescricoes",
    element: (
      <WithAuth component={ScreeningList} prioritizationType={"prescription"} />
    ),
  },
  {
    exact: true,
    path: "/priorizacao/pacientes",
    element: (
      <WithAuth component={ScreeningList} prioritizationType={"patient"} />
    ),
  },
  {
    exact: true,
    path: "/priorizacao/conciliacoes",
    element: (
      <WithAuth component={ScreeningList} prioritizationType={"conciliation"} />
    ),
  },
  {
    exact: true,
    path: "/prescricao/:slug",
    element: <WithAuth component={Screening} />,
  },
  // {
  //   exact: true,
  //   path: "/conciliacao/:id",
  //   element: <WithAuth component={Conciliation} />
  // },
  {
    exact: true,
    path: "/segmentos",
    element: <WithAuth component={Segments} />,
  },
  {
    exact: true,
    path: "/exames",
    element: <WithAuth component={Segments} />,
  },
  {
    exact: true,
    path: "/segmentos/:idSegment/:slug",
    element: <WithAuth component={Segments} />,
  },
  {
    exact: true,
    path: "/exames/:idSegment/:slug",
    element: <WithAuth component={Segments} />,
  },
  {
    exact: true,
    path: "/medicamentos",
    element: <WithAuth component={References} />,
  },
  {
    exact: true,
    path: "/medicamentos/:idSegment",
    element: <WithAuth component={References} />,
  },
  {
    exact: true,
    path: "/medicamentos/:idSegment/:idDrug/:slug",
    element: <WithAuth component={References} />,
  },
  {
    exact: true,
    path: "/medicamentos/:idSegment/:idDrug/:slug/:dose/:frequency",
    element: <WithAuth component={References} />,
  },
  {
    exact: true,
    path: "/relatorios",
    element: <WithAuth component={Reports} />,
  },
  {
    exact: true,
    path: "/relatorios/visualizar",
    element: <WithAuth component={ViewReport} />,
  },
  {
    exact: true,
    path: "/intervencoes",
    element: <WithAuth component={InterventionList} />,
  },

  {
    exact: true,
    path: "/configuracoes/usuario",
    element: <WithAuth component={UserConfig} />,
  },
  {
    exact: true,
    path: "/configuracoes/administracao",
    element: <WithAuth component={UserAdmin} />,
  },
  {
    exact: true,
    path: "/priorizacao/pacientes/:startDate",
    element: (
      <WithAuth component={ScreeningList} prioritizationType={"patient"} />
    ),
  },
  {
    exact: true,
    path: "/priorizacao/prescricoes/:startDate",
    element: (
      <WithAuth component={ScreeningList} prioritizationType={"prescription"} />
    ),
  },
  {
    exact: true,
    path: "/priorizacao/conciliacoes/:startDate",
    element: (
      <WithAuth component={ScreeningList} prioritizationType={"conciliation"} />
    ),
  },
  {
    exact: true,
    path: "/pacientes",
    element: <WithAuth component={PatientList} />,
  },
];

export default routes;
