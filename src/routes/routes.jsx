/**
 * Auth verification
 */
import WithAuth from "lib/withAuth";
import JourneySwitch from "lib/chooseJourney";

/**
 * Pages
 */
import Login from "pages/Login";
import LoginCallback from "pages/Login/LoginCallback";
import ScreeningList from "pages/ScreeningList";
import Screening from "pages/Screening";
import References from "pages/References";
import Reports from "pages/Reports";
import InterventionList from "pages/InterventionList";
import UserConfig from "pages/UserConfig";
import Password from "pages/Password";
import Conciliation from "pages/Conciliation";
import UserAdmin from "pages/UserAdmin";
import PatientList from "pages/PatientList";
import Prioritization from "pages/Prioritization";
import ClinicalNotes from "pages/Screening/ClinicalNotes";
import Summary from "pages/Summary";
import SummarySearch from "pages/Summary/SummarySearch";
import SupportCenter from "pages/SupportCenter";
import SwitchSchema from "pages/SwitchSchema";

import AdminFrequency from "pages/Admin/Frequency";
import AdminTag from "pages/Admin/Tag";
import AdminInterventionReason from "pages/Admin/InterventionReason";
import AdminMemory from "pages/Admin/Memory";
import AdminMemoryRoutes from "pages/Admin/Memory/Routes";
import AdminMemoryReports from "pages/Admin/Memory/Reports";
import AdminMemoryFeatures from "pages/Admin/Memory/Features";
import AdminMemorySchedules from "pages/Admin/Memory/Schedules";
import AdminDrugAttributes from "pages/Admin/DrugAttributes";
import AdminIntegration from "pages/Admin/Integration";
import AdminIntegrationStatus from "pages/Admin/IntegrationStatus";
import AdminIntegrationConfig from "pages/Admin/IntegrationConfig";
import AdminIntegrationRemote from "pages/Admin/IntegrationRemote";
import AdminIntegrationRemoteNifi from "pages/Admin/IntegrationRemote/Nifi";
import AdminSegment from "pages/Admin/Segment";
import AdminUnitConversion from "pages/Admin/UnitConversion";
import AdminExam from "pages/Admin/Exam";
import AdminSubstance from "pages/Admin/Substance";
import AdminRelation from "pages/Admin/Relation";
import AdminMeasureUnit from "pages/Admin/MeasureUnit";
import AdminProtocol from "pages/Admin/Protocol";
import AdminReport from "pages/Admin/Report";
import AdminGlobalMemoryNZero from "pages/Admin/GlobalMemory/GlobalMemoryNZero";

import PatientDayReport from "pages/Reports/PatientDayReport";
import PrescriptionReport from "pages/Reports/PrescriptionReport";
import InterventionReport from "pages/Reports/InterventionReport";
import PrescriptionAuditReport from "pages/Reports/PrescriptionAuditReport";
import EconomyReport from "pages/Reports/EconomyReport";
import IntegrationNifiLintReport from "pages/Reports/IntegrationNifiLint";

import RegulationPrioritization from "pages/Regulation/Prioritization";
import Regulation from "pages/Regulation/Regulation";
import RegulationIndicatorsPanelReport from "pages/Regulation/IndicatorsPanelReport";

const routes = [
  {
    exact: true,
    path: "/login",
    element: <WithAuth component={Login} isLoginPage={true} />,
  },
  {
    exact: true,
    path: "/login/noharm",
    element: (
      <WithAuth component={Login} isLoginPage={true} forceSchema="hsc_test" />
    ),
  },
  {
    exact: true,
    path: "/login/:schema",
    element: <WithAuth component={Login} isLoginPage={true} />,
  },

  {
    exact: true,
    path: "/reset/:token",
    element: <WithAuth component={Password} isLogoutPage={true} />,
  },
  {
    exact: true,
    path: "/login-callback/:schema",
    element: <WithAuth component={LoginCallback} isLoginPage={true} />,
  },
  {
    exact: true,
    path: "/",
    element: <WithAuth component={JourneySwitch} />,
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
  {
    exact: true,
    path: "/conciliacao/:slug",
    element: <WithAuth component={Conciliation} />,
  },
  {
    exact: true,
    path: "/prescricao/evolucao/:admissionNumber",
    element: <WithAuth component={ClinicalNotes} />,
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
    path: "/priorizacao/pacientes/cards",
    element: (
      <WithAuth component={Prioritization} prioritizationType={"patient"} />
    ),
  },
  {
    exact: true,
    path: "/priorizacao/pacientes/cards/:startDate",
    element: (
      <WithAuth component={Prioritization} prioritizationType={"patient"} />
    ),
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
  {
    exact: true,
    path: "/sumario-alta",
    element: <WithAuth component={SummarySearch} />,
  },
  {
    exact: true,
    path: "/switch-schema",
    element: <WithAuth component={SwitchSchema} />,
  },
  {
    exact: true,
    path: "/sumario-alta/:admissionNumber",
    element: <WithAuth component={Summary} />,
  },
  {
    exact: true,
    path: "/sumario-alta/:admissionNumber/mock",
    element: <WithAuth component={Summary} mock={true} />,
  },
  {
    exact: true,
    path: "/suporte",
    element: <WithAuth component={SupportCenter} />,
  },
  {
    exact: true,
    path: "/admin/frequencias",
    element: <WithAuth component={AdminFrequency} />,
  },
  {
    exact: true,
    path: "/admin/exames",
    element: <WithAuth component={AdminExam} />,
  },
  {
    exact: true,
    path: "/admin/motivo-intervencao",
    element: <WithAuth component={AdminInterventionReason} />,
  },
  {
    exact: true,
    path: "/admin/memoria",
    element: <WithAuth component={AdminMemory} />,
  },
  {
    exact: true,
    path: "/admin/vias",
    element: <WithAuth component={AdminMemoryRoutes} />,
  },
  {
    exact: true,
    path: "/admin/relatorios",
    element: <WithAuth component={AdminMemoryReports} />,
  },
  {
    exact: true,
    path: "/admin/features",
    element: <WithAuth component={AdminMemoryFeatures} />,
  },
  {
    exact: true,
    path: "/admin/tags",
    element: <WithAuth component={AdminTag} />,
  },
  {
    exact: true,
    path: "/admin/horarios",
    element: <WithAuth component={AdminMemorySchedules} />,
  },
  {
    exact: true,
    path: "/admin/curadoria-medicamentos",
    element: <WithAuth component={AdminDrugAttributes} />,
  },
  {
    exact: true,
    path: "/admin/integracao",
    element: <WithAuth component={AdminIntegration} />,
  },
  {
    exact: true,
    path: "/admin/integracao/status",
    element: <WithAuth component={AdminIntegrationStatus} />,
  },
  {
    exact: true,
    path: "/admin/integracao/config",
    element: <WithAuth component={AdminIntegrationConfig} />,
  },
  {
    exact: true,
    path: "/admin/integracao/acesso-remoto",
    element: <WithAuth component={AdminIntegrationRemote} />,
  },
  {
    exact: true,
    path: "/admin/integracao/acesso-remoto/nifi",
    element: <WithAuth component={AdminIntegrationRemoteNifi} />,
  },
  {
    exact: true,
    path: "/admin/segmentos",
    element: <WithAuth component={AdminSegment} />,
  },
  {
    exact: true,
    path: "/admin/curadoria-unidades",
    element: <WithAuth component={AdminUnitConversion} />,
  },
  {
    exact: true,
    path: "/admin/unidade-medida",
    element: <WithAuth component={AdminMeasureUnit} />,
  },
  {
    exact: true,
    path: "/admin/substancias",
    element: <WithAuth component={AdminSubstance} />,
  },
  {
    exact: true,
    path: "/admin/relacoes",
    element: <WithAuth component={AdminRelation} />,
  },
  {
    exact: true,
    path: "/admin/protocolos",
    element: <WithAuth component={AdminProtocol} />,
  },
  {
    exact: true,
    path: "/admin/relatorios-customizados",
    element: <WithAuth component={AdminReport} />,
  },
  {
    exact: true,
    path: "/admin/memoria-global/nzero",
    element: <WithAuth component={AdminGlobalMemoryNZero} />,
  },
  {
    exact: true,
    path: "/relatorios/pacientes-dia",
    element: <WithAuth component={PatientDayReport} />,
  },
  {
    exact: true,
    path: "/relatorios/prescricoes",
    element: <WithAuth component={PrescriptionReport} />,
  },
  {
    exact: true,
    path: "/relatorios/intervencoes",
    element: <WithAuth component={InterventionReport} />,
  },
  {
    exact: true,
    path: "/relatorios/audit",
    element: <WithAuth component={PrescriptionAuditReport} />,
  },
  {
    exact: true,
    path: "/relatorios/economia",
    element: <WithAuth component={EconomyReport} />,
  },
  {
    exact: true,
    path: "/relatorios/integracao/nifilint",
    element: <WithAuth component={IntegrationNifiLintReport} />,
  },
  {
    exact: true,
    path: "/relatorios/regulacao/painel-indicadores",
    element: <WithAuth component={RegulationIndicatorsPanelReport} />,
  },
  {
    exact: true,
    path: "/regulacao",
    element: <WithAuth component={RegulationPrioritization} />,
  },
  {
    exact: true,
    path: "/regulacao/:id",
    element: <WithAuth component={Regulation} />,
  },
];

export default routes;
