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
} from "@ant-design/icons";

import Feature from "models/Feature";
import { Wrapper as Navigator } from "./Menu.style";

export default function Menu({ security, featureService }) {
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
    if (item.role && !security.hasAnyRole(item.role)) {
      return;
    }

    if (item.notrole && security.hasAnyRole(item.notrole)) {
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
      role: ["summary"],
    },
    {
      key: "prioritization",
      link: "prioritization",
      label: t("menu.prioritization"),
      icon: <TableOutlined />,
      id: "gtm-lnk-priorizacao",
      notrole: ["doctor"],
      children: [
        {
          key: "/priorizacao/prescricoes",
          link: "/priorizacao/prescricoes",
          label: t("menu.prioritization-prescription"),
          icon: <FileTextOutlined />,
          id: "gtm-lnk-priorizacao-prescricao",
          notrole: ["cpoe"],
        },
        {
          key: "/priorizacao/pacientes/cards",
          link: "/priorizacao/pacientes/cards",
          label: t("menu.prioritization-lab"),
          icon: <ExperimentOutlined />,
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
      notrole: ["doctor"],
    },
    {
      key: "/intervencoes",
      link: "/intervencoes",
      label: t("menu.interventions"),
      icon: <WarningOutlined />,
      id: "gtm-lnk-intervencoes",
      notrole: ["doctor"],
    },
    {
      key: "/relatorios",
      link: "/relatorios",
      label: t("menu.reports"),
      icon: <PieChartOutlined />,
      id: "gtm-lnk-report",
      notrole: ["doctor"],
    },
    {
      key: "https://noharm.octadesk.com/kb",
      link: "https://noharm.octadesk.com/kb",
      label: t("menu.knowledgeBase"),
      icon: <BulbOutlined />,
      id: "gtm-lnk-knowledgeBase",
    },
    {
      key: "https://noharm.octadesk.com/kb/article/novidades",
      link: "https://noharm.octadesk.com/kb/article/novidades",
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
          key: "/medicamentos",
          link: "/medicamentos",
          label: t("menu.medications"),
          icon: <MedicineBoxOutlined />,
          id: "gtm-lnk-medicamentos",
          notrole: ["doctor"],
        },
        {
          key: "/exames",
          link: "/exames",
          label: t("menu.exams"),
          icon: <ExperimentOutlined />,
          id: "gtm-lnk-exames",
          notrole: ["doctor"],
        },
        {
          key: "/configuracoes/usuario",
          link: "/configuracoes/usuario",
          label: t("menu.userConfig"),
          icon: <UserOutlined />,
          id: "gtm-lnk-usuario",
        },
        {
          key: "/configuracoes/administracao",
          link: "/configuracoes/administracao",
          label: t("menu.user-administration"),
          icon: <UsergroupAddOutlined />,
          id: "gtm-lnk-user-administration",
          role: ["userAdmin"],
        },
      ],
    },

    {
      key: "support",
      label: "Curadoria",
      icon: <ControlOutlined />,
      role: ["admin", "training"],
      children: [
        {
          key: "/configuracoes/administracao2",
          link: "/configuracoes/administracao",
          label: t("menu.user-administration"),
          icon: <UsergroupAddOutlined />,
          id: "gtm-lnk-user-administration",
          role: ["userAdmin"],
        },
        {
          key: "/admin/curadoria-medicamentos",
          link: "/admin/curadoria-medicamentos",
          label: "Curadoria medicamentos",
          icon: <TableOutlined />,
          id: "gtm-lnk-attr-drugs",
          role: ["admin", "training"],
        },

        {
          key: "/admin/frequencias",
          link: "/admin/frequencias",
          label: t("menu.frequency"),
          icon: <HourglassOutlined />,
          id: "gtm-lnk-frequencias",
          role: ["admin", "training"],
        },
        {
          key: "/medicamentos2",
          link: "/medicamentos",
          label: "Medicamentos (Antigo)",
          icon: <MedicineBoxOutlined />,
          id: "gtm-lnk-medicamentos",
          notrole: ["doctor"],
        },
        {
          key: "/admin/motivo-intervencao",
          link: "/admin/motivo-intervencao",
          label: t("menu.interventionReasons"),
          icon: <WarningOutlined />,
          id: "gtm-lnk-intv-reason",
          role: ["admin", "training"],
        },
        {
          key: "/exames2",
          link: "/exames",
          label: "Setores/Exames",
          icon: <ExperimentOutlined />,
          id: "gtm-lnk-exames",
          notrole: ["doctor"],
        },
        // {
        //   key: "/admin/segmentos",
        //   link: "/admin/segmentos",
        //   label: "Segmentos",
        //   icon: <ExperimentOutlined />,
        //   id: "gtm-lnk-segmentos",
        //   role: ["admin", "training"],
        // },
      ],
    },
    {
      key: "integration",
      label: t("menu.integration"),
      icon: <ApiOutlined />,
      role: ["admin"],
      children: [
        {
          key: "/admin/integracao",
          link: "/admin/integracao",
          label: "Utilidades",
          icon: <CodeOutlined />,
          id: "gtm-lnk-integration",
          role: ["admin"],
        },
        {
          key: "/admin/memoria",
          link: "/admin/memoria",
          label: t("menu.memory"),
          icon: <SaveOutlined />,
          id: "gtm-lnk-memory",
          role: ["admin"],
        },
      ],
    },
  ];

  return (
    <Navigator
      mode="vertical"
      theme="dark"
      selectedKeys={[location.pathname]}
      items={getItems(items)}
      onClick={linkTo}
    ></Navigator>
  );
}
