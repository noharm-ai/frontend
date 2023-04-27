import {
  TableOutlined,
  FileTextOutlined,
  UserOutlined,
  ReconciliationOutlined,
  WarningOutlined,
  PieChartOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  MedicineBoxOutlined,
  UsergroupAddOutlined,
  ExperimentOutlined,
  HourglassOutlined,
  SaveOutlined,
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
        notRole: ["cpoe"],
      },
      {
        key: "/priorizacao/pacientes/cards",
        text: "menu.prioritization-lab",
        icon: ExperimentOutlined,
        id: "gtm-lnk-priorizacao-cards",
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
        feature: Feature.CONCILIATION,
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
    key: { pathname: "https://noharm.octadesk.com/kb/article/novidades" },
    text: "menu.news",
    icon: ThunderboltOutlined,
    id: "gtm-lnk-news",
  },
  {
    key: "config",
    text: "menu.config",
    icon: SettingOutlined,
    id: "gtm-lnk-config",
    children: [
      {
        key: "/admin/frequencias",
        text: "menu.frequency",
        icon: HourglassOutlined,
        id: "gtm-lnk-frequencias",
        role: ["admin"],
      },
      {
        key: "/admin/memoria",
        text: "menu.memory",
        icon: SaveOutlined,
        id: "gtm-lnk-memory",
        role: ["admin"],
      },
      {
        key: "/admin/motivo-intervencao",
        text: "menu.interventionReasons",
        icon: WarningOutlined,
        id: "gtm-lnk-intv-reason",
        role: ["admin"],
      },
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
        role: ["userAdmin"],
      },
    ],
  },
];

export default navigation;
