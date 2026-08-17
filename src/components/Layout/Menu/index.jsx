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
  SaveOutlined,
  ControlOutlined,
  CustomerServiceOutlined,
  FieldTimeOutlined,
  TagsOutlined,
  FilePptOutlined,
  FormOutlined,
  LayoutOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { Menu as Navigator } from "antd";

import Feature from "models/Feature";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";
import { FeatureService } from "services/FeatureService";
import { getStorageItem } from "utils/storage";

export default function Menu({ segments }) {
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

    if (item.feature && !FeatureService.has(item.feature)) {
      return;
    }

    if (item.featurehide && FeatureService.has(item.featurehide)) {
      return;
    }

    if (item.key === "/priorizacao/prescricoes") {
      if (segments.filter((s) => s.cpoe).length === segments.length) {
        // all cpoe segments
        return;
      }
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
      featurehide: Feature.PRIMARYCARE,
      children: [
        {
          key: "/priorizacao/prescricoes",
          link: "/priorizacao/prescricoes",
          label: t("menu.prioritization-prescription"),
          icon: <FileTextOutlined />,
          id: "gtm-lnk-priorizacao-prescricao",
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
          // without READ_USERS the page shows the user managers contact list
          permission: [Permission.READ_USERS, Permission.READ_BASIC_FEATURES],
        },
        {
          key: "/admin/exames",
          link: "/admin/exames",
          label: t("menu.exams"),
          icon: <ExperimentOutlined />,
          id: "gtm-lnk-exames",
          // ADMIN_EXAMS is the deprecated fallback, remove after backend release
          permission: [Permission.READ_CONFIG_EXAMS, Permission.ADMIN_EXAMS],
        },
        {
          key: "/configuracoes/forms-personalizados",
          link: "/configuracoes/forms-personalizados",
          label: "Formulários de evolução",
          icon: <FormOutlined />,
          id: "gtm-lnk-customForms",
          permission: [Permission.WRITE_CUSTOM_FORMS],
        },
        {
          key: "/configuracoes/memoria",
          link: "/configuracoes/memoria",
          label: "Memória",
          icon: <SaveOutlined />,
          id: "gtm-lnk-memory",
          permission: [Permission.READ_NAV],
        },
        {
          key: "/admin/tags",
          link: "/admin/tags",
          label: t("menu.tag"),
          icon: <TagsOutlined />,
          id: "gtm-lnk-tags",
          permission: [Permission.READ_TAGS, Permission.WRITE_TAGS],
        },
        {
          key: "/painel-medicamentos",
          link: "/painel-medicamentos",
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
          key: `${import.meta.env.VITE_APP_ADMIN_LINK}/select-schema/${getStorageItem("schema")}`,
          link: `${import.meta.env.VITE_APP_ADMIN_LINK}/select-schema/${getStorageItem("schema")}`,
          label: "Admin",
          icon: <LayoutOutlined />,
          id: "gtm-lnk-admin",
        },
        // {
        //   key: "curadoria-medicamentos",
        //   label: "Curadoria medicamentos",
        //   icon: <TableOutlined />,
        //   id: "gtm-lnk-attr-drugs",
        //   children: [
        //     {
        //       key: "/admin/curadoria-medicamentos",
        //       link: "/admin/curadoria-medicamentos",
        //       label: "Geral",
        //       icon: <TableOutlined />,
        //       id: "gtm-lnk-attr-drugs",
        //     },
        //   ],
        // },

        // {
        //   key: "/admin/horarios",
        //   link: "/admin/horarios",
        //   label: t("menu.schedules"),
        //   icon: <HourglassOutlined />,
        //   id: "gtm-lnk-horarios",
        // },
        // {
        //   key: "/admin/memoria-global/nzero",
        //   link: "/admin/memoria-global/nzero",
        //   label: "NZero",
        //   icon: <RobotOutlined />,
        //   id: "gtm-lnk-nzero",
        //   permission: [Permission.ADMIN_NZERO],
        // },
        {
          key: "/admin/protocolos",
          link: "/admin/protocolos",
          label: "Protocolos",
          icon: <FilePptOutlined />,
          id: "gtm-lnk-protocols",
          permission: [Permission.READ_PROTOCOLS],
        },
        // {
        //   key: "/admin/relatorios-customizados",
        //   link: "/admin/relatorios-customizados",
        //   label: "Relatórios Customizados",
        //   icon: <PieChartOutlined />,
        //   id: "gtm-lnk-relatorios-custom",
        //   permission: [Permission.READ_CUSTOM_REPORTS],
        // },
      ],
    },
    {
      key: "/treinamento",
      link: "/treinamento",
      label: t("menu.training"),
      icon: <ReadOutlined />,
      id: "gtm-lnk-training",
      feature: Feature.USER_ONBOARDING,
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
