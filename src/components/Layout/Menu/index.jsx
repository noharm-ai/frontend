import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  FileDoneOutlined,
  ApiOutlined,
  CodeOutlined,
  ControlOutlined,
  AppstoreOutlined,
  BranchesOutlined,
  CustomerServiceOutlined,
  FlagOutlined,
  SwapOutlined,
  CheckOutlined,
  DeploymentUnitOutlined,
  TagOutlined,
  InteractionOutlined,
  FieldTimeOutlined,
  GoldOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Menu as Navigator } from "antd";

import Feature from "models/Feature";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";
import SecurityService from "services/security";

export default function Menu({ featureService }) {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const linkTo = (menuItem) => {
    if (menuItem.item.props.link.indexOf("https") !== -1) {
      window.open(menuItem.item.props.link, "_blank");
    } else {
      navigate(menuItem.item.props.link);
    }
  };

  const hasPermission = (item) => {
    if (item.permission && !PermissionService().hasAny(item.permission)) {
      return;
    }

    if (item.notcpoe && SecurityService().hasCpoe()) {
      return;
    }

    if (item.feature && !featureService.hasFeature(item.feature)) {
      return;
    }

    return item;
  };

  const getItems = (items) => {
    return items.map((i) => {
      if (hasPermission(i)) {
        if (i.children) {
          const children = [...i.children].map((c) => hasPermission(c));
          i.children = children;
        }

        return i;
      }

      return null;
    });
  };

  const items = [
    {
      key: "/sumario-alta",
      link: "/sumario-alta",
      label: t("menu.summary"),
      icon: <FileDoneOutlined />,
      id: "gtm-lnk-summary",
      feature: Feature.DISCHARGE_SUMMARY,
      permission: [Permission.READ_DISCHARGE_SUMMARY],
    },
    {
      key: "/regulacao",
      link: "/regulacao",
      label: "Regulação",
      icon: <FieldTimeOutlined />,
      id: "gtm-lnk-regulation",
      feature: Feature.REGULATION,
      permission: [Permission.READ_REGULATION],
    },
    {
      key: "prioritization",
      link: "prioritization",
      label: t("menu.prioritization"),
      icon: <TableOutlined />,
      id: "gtm-lnk-priorizacao",
      permission: [Permission.READ_PRESCRIPTION],
      children: [
        {
          key: "/priorizacao/prescricoes",
          link: "/priorizacao/prescricoes",
          label: t("menu.prioritization-prescription"),
          icon: <FileTextOutlined />,
          id: "gtm-lnk-priorizacao-prescricao",
          notcpoe: "notcpoe",
        },
        {
          key: "/priorizacao/pacientes/cards",
          link: "/priorizacao/pacientes/cards",
          label: t("menu.prioritization-lab"),
          icon: <UserOutlined />,
          id: "gtm-lnk-priorizacao-cards",
        },
        {
          key: "/priorizacao/pacientes",
          link: "/priorizacao/pacientes",
          label: t("menu.prioritization-patient"),
          icon: <UserOutlined />,
          id: "gtm-lnk-priorizacao-paciente",
        },
        {
          key: "/priorizacao/conciliacoes",
          link: "/priorizacao/conciliacoes",
          label: t("menu.prioritization-conciliation"),
          icon: <ReconciliationOutlined />,
          id: "gtm-lnk-priorizacao-conciliacao",
          feature: Feature.CONCILIATION,
        },
      ],
    },

    {
      key: "/pacientes",
      link: "/pacientes",
      label: t("menu.patients"),
      icon: <UserOutlined />,
      id: "gtm-lnk-patients",
      feature: Feature.PRIMARYCARE,
    },
    {
      key: "/intervencoes",
      link: "/intervencoes",
      label: t("menu.interventions"),
      icon: <WarningOutlined />,
      id: "gtm-lnk-intervencoes",
      permission: [Permission.READ_PRESCRIPTION],
    },
    {
      key: "/relatorios",
      link: "/relatorios",
      label: t("menu.reports"),
      icon: <PieChartOutlined />,
      id: "gtm-lnk-report",
      permission: [Permission.READ_REPORTS],
    },
    {
      key: `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/39`,
      link: `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/39`,
      label: t("menu.knowledgeBase"),
      icon: <BulbOutlined />,
      id: "gtm-lnk-knowledgeBase",
    },
    {
      key: `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/137`,
      link: `${import.meta.env.VITE_APP_ODOO_LINK}/knowledge/article/137`,
      label: t("menu.news"),
      icon: <ThunderboltOutlined />,
      id: "gtm-lnk-news",
    },
    {
      key: "config",
      label: t("menu.config"),
      icon: <SettingOutlined />,
      id: "gtm-lnk-config",
      children: [
        {
          key: "/configuracoes/administracao",
          link: "/configuracoes/administracao",
          label: t("menu.user-administration"),
          icon: <UsergroupAddOutlined />,
          id: "gtm-lnk-user-administration",
          permission: [Permission.READ_USERS],
        },
        {
          key: "/admin/exames",
          link: "/admin/exames",
          label: t("menu.exams"),
          icon: <ExperimentOutlined />,
          id: "gtm-lnk-exames",
          permission: [Permission.ADMIN_EXAMS],
        },
        {
          key: "/admin/tags",
          link: "/admin/tags",
          label: t("menu.tag"),
          icon: <TagsOutlined />,
          id: "gtm-lnk-tags",
          permission: [Permission.WRITE_TAGS],
        },
        {
          key: "/medicamentos",
          link: "/medicamentos",
          label: t("menu.medications"),
          icon: <MedicineBoxOutlined />,
          id: "gtm-lnk-medicamentos",
          permission: [Permission.READ_PRESCRIPTION],
        },

        {
          key: "/configuracoes/usuario",
          link: "/configuracoes/usuario",
          label: t("menu.userConfig"),
          icon: <UserOutlined />,
          id: "gtm-lnk-usuario",
        },
      ],
    },

    {
      key: "support",
      label: "Curadoria",
      icon: <ControlOutlined />,
      permission: [Permission.MAINTAINER],
      children: [
        {
          key: "/admin/curadoria-medicamentos",
          link: "/admin/curadoria-medicamentos",
          label: "Curadoria medicamentos",
          icon: <TableOutlined />,
          id: "gtm-lnk-attr-drugs",
        },
        {
          key: "/admin/curadoria-unidades",
          link: "/admin/curadoria-unidades",
          label: "Curadoria unidades",
          icon: <SwapOutlined />,
          id: "gtm-lnk-units-drugs",
        },
        {
          key: "/admin/exames2",
          link: "/admin/exames",
          label: "Exames",
          icon: <ExperimentOutlined />,
          id: "gtm-lnk-exames",
        },
        {
          key: "/admin/features",
          link: "/admin/features",
          label: "Features",
          icon: <FlagOutlined />,
          id: "gtm-lnk-features",
        },
        {
          key: "/admin/frequencias",
          link: "/admin/frequencias",
          label: t("menu.frequency"),
          icon: <HourglassOutlined />,
          id: "gtm-lnk-frequencias",
        },
        {
          key: "/admin/horarios",
          link: "/admin/horarios",
          label: t("menu.schedules"),
          icon: <HourglassOutlined />,
          id: "gtm-lnk-horarios",
        },
        {
          key: "/admin/motivo-intervencao",
          link: "/admin/motivo-intervencao",
          label: t("menu.interventionReasons"),
          icon: <WarningOutlined />,
          id: "gtm-lnk-intv-reason",
        },

        {
          key: "/admin/relacoes",
          link: "/admin/relacoes",
          label: "Relações Medicamentosas",
          icon: <InteractionOutlined />,
          id: "gtm-lnk-relations",
        },

        {
          key: "/admin/relatorios",
          link: "/admin/relatorios",
          label: "Relatórios",
          icon: <PieChartOutlined />,
          id: "gtm-lnk-relatorios",
        },
        {
          key: "/admin/segmentos",
          link: "/admin/segmentos",
          label: "Segmentos",
          icon: <AppstoreOutlined />,
          id: "gtm-lnk-segmentos",
        },
        {
          key: "/admin/substancias",
          link: "/admin/substancias",
          label: "Substâncias",
          icon: <TagOutlined />,
          id: "gtm-lnk-substancias",
        },
        {
          key: "/admin/tags2",
          link: "/admin/tags",
          label: t("menu.tag"),
          icon: <TagsOutlined />,
          id: "gtm-lnk-tags",
          permission: [Permission.WRITE_TAGS],
        },
        {
          key: "/admin/unidade-medida",
          link: "/admin/unidade-medida",
          label: "Unidades de Medida",
          icon: <GoldOutlined />,
          id: "gtm-lnk-unitmeasure",
        },
        {
          key: "/admin/vias",
          link: "/admin/vias",
          label: "Vias",
          icon: <BranchesOutlined />,
          id: "gtm-lnk-vias",
        },
      ],
    },
    {
      key: "integration",
      label: t("menu.integration"),
      icon: <ApiOutlined />,
      permission: [Permission.INTEGRATION_UTILS],
      children: [
        {
          key: "/admin/integracao/acesso-remoto",
          link: "/admin/integracao/acesso-remoto",
          label: "Acesso Remoto",
          icon: <DeploymentUnitOutlined />,
          id: "gtm-lnk-integration-remote",
        },
        {
          key: "/admin/integracao",
          link: "/admin/integracao",
          label: "Utilidades",
          icon: <CodeOutlined />,
          id: "gtm-lnk-integration",
        },
        {
          key: "/admin/memoria",
          link: "/admin/memoria",
          label: t("menu.memory"),
          icon: <SaveOutlined />,
          id: "gtm-lnk-memory",
        },
        {
          key: "/admin/integracao/status",
          link: "/admin/integracao/status",
          label: "Status",
          icon: <CheckOutlined />,
          id: "gtm-lnk-int-status",
        },
        {
          key: "/admin/integracao/config",
          link: "/admin/integracao/config",
          label: "Configuração Integrações",
          icon: <SettingOutlined />,
          id: "gtm-lnk-int-config",
        },
      ],
    },
    {
      key: "help",
      link: "/suporte",
      label: t("menu.help"),
      icon: <CustomerServiceOutlined />,
      id: "gtm-lnk-help",
    },
  ];

  return (
    <Navigator
      mode="vertical"
      theme="dark"
      selectedKeys={[location.pathname]}
      items={getItems(items)}
      onClick={linkTo}
    />
  );
}
