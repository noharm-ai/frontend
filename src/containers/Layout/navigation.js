import {
  TableOutlined,
  FileTextOutlined,
  UserOutlined,
  ReconciliationOutlined,
  WarningOutlined,
  PieChartOutlined,
  BulbOutlined,
  SettingOutlined,
  MedicineBoxOutlined,
  UsergroupAddOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";

import Feature from "models/Feature";

const navigation = [
  {
    key: "prioritization",
    text: "menu.prioritization",
    icon: TableOutlined,
    id: "gtm-lnk-priorizacao",
    children: [
      {
        key: "/priorizacao/prescricoes",
        text: "menu.prioritization-prescription",
        icon: FileTextOutlined,
        id: "gtm-lnk-priorizacao-prescricao",
      },
      {
        key: "/priorizacao/pacientes",
        text: "menu.prioritization-patient",
        icon: UserOutlined,
        id: "gtm-lnk-priorizacao-paciente",
      },
      {
        key: "/priorizacao/conciliacoes",
        text: "menu.prioritization-conciliation",
        icon: ReconciliationOutlined,
        id: "gtm-lnk-priorizacao-conciliacao",
        role: "concilia",
      },
      {
        key: "/priorizacao-lab",
        text: "menu.prioritization-lab",
        icon: ExperimentOutlined,
        id: "gtm-lnk-priorizacao-lab",
        role: "suporte",
      },
    ],
  },
  {
    key: "/pacientes",
    text: "menu.patients",
    icon: UserOutlined,
    id: "gtm-lnk-patients",
    feature: Feature.PRIMARYCARE,
  },
  {
    key: "/intervencoes",
    text: "menu.interventions",
    icon: WarningOutlined,
    id: "gtm-lnk-intervencoes",
  },
  {
    key: "/relatorios",
    text: "menu.reports",
    icon: PieChartOutlined,
    id: "gtm-lnk-report",
  },
  {
    key: { pathname: "https://noharm.octadesk.com/kb" },
    text: "menu.knowledgeBase",
    icon: BulbOutlined,
    id: "gtm-lnk-knowledgeBase",
  },
  {
    key: "config",
    text: "menu.config",
    icon: SettingOutlined,
    id: "gtm-lnk-config",
    children: [
      {
        key: "/medicamentos",
        text: "menu.medications",
        icon: "drug",
        id: "gtm-lnk-medicamentos",
      },
      {
        key: "/exames",
        text: "menu.exams",
        icon: MedicineBoxOutlined,
        id: "gtm-lnk-exames",
      },
      {
        key: "/configuracoes/usuario",
        text: "menu.userConfig",
        icon: UserOutlined,
        id: "gtm-lnk-usuario",
      },
      {
        key: "/configuracoes/administracao",
        text: "menu.user-administration",
        icon: UsergroupAddOutlined,
        id: "gtm-lnk-user-administration",
        role: "userAdmin",
      },
    ],
  },
];

export default navigation;
