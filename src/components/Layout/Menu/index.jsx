import React from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "@ant-design/icons";

import Icon from "components/Icon";
import Feature from "models/Feature";
import { Wrapper as Navigator } from "./Menu.style";

export default function Menu({ security, featureService }) {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const ItemTitle = ({ icon, text }) => {
    if (icon.render) {
      const CustomIcon = icon;

      return (
        <>
          {icon && <CustomIcon style={{ fontSize: 14 }} />}
          <span>{text}</span>
        </>
      );
    }

    return (
      <>
        {icon && <Icon type={icon} style={{ fontSize: 14 }} />}
        <span>{text}</span>
      </>
    );
  };

  const renderItem = ({ text, key, icon, id, role, notRole, feature }, t) => {
    if (role && !security.hasAnyRole(role)) {
      return;
    }

    if (notRole && security.hasAnyRole(notRole)) {
      return;
    }

    if (feature && !featureService.hasFeature(feature)) {
      return;
    }

    return (
      <Navigator.Item key={key.pathname ? key.pathname : key}>
        {key.pathname ? (
          <a
            href={key.pathname}
            className="nav-text"
            target="_blank"
            rel="noreferrer noopener"
          >
            <ItemTitle icon={icon} text={t(text)} />
          </a>
        ) : (
          <Link className="nav-text" id={id} to={key} target="_blank">
            <ItemTitle icon={icon} text={t(text)} />
          </Link>
        )}
      </Navigator.Item>
    );
  };

  const renderMenu = (navigation, t) => {
    return navigation.map((item) => {
      if (item.children) {
        return (
          <Navigator.SubMenu
            key={item.key}
            title={<ItemTitle icon={item.icon} text={t(item.text)} />}
          >
            <>{item.children.map((item) => renderItem(item, t))}</>
          </Navigator.SubMenu>
        );
      }

      return renderItem(item, t);
    });
  };

  const linkTo = (item) => {
    if (item.key.indexOf("https") !== -1) {
      window.open(item.key, "_blank");
    } else {
      navigate(item.key);
    }
  };

  const items = [
    {
      key: "prioritization",
      label: t("menu.prioritization"),
      icon: <TableOutlined />,
      id: "gtm-lnk-priorizacao",
      children: [
        {
          key: "/priorizacao/prescricoes",
          label: t("menu.prioritization-prescription"),
          icon: <FileTextOutlined />,
          id: "gtm-lnk-priorizacao-prescricao",
          //notRole: ["cpoe"],
        },
        {
          key: "/priorizacao/pacientes/cards",
          label: t("menu.prioritization-lab"),
          icon: <ExperimentOutlined />,
          id: "gtm-lnk-priorizacao-cards",
        },
        {
          key: "/priorizacao/pacientes",
          label: t("menu.prioritization-patient"),
          icon: <UserOutlined />,
          id: "gtm-lnk-priorizacao-paciente",
        },
        {
          key: "/priorizacao/conciliacoes",
          label: t("menu.prioritization-conciliation"),
          icon: <ReconciliationOutlined />,
          id: "gtm-lnk-priorizacao-conciliacao",
          //feature: Feature.CONCILIATION,
        },
      ],
    },

    {
      key: "/pacientes",
      label: t("menu.patients"),
      icon: <UserOutlined />,
      id: "gtm-lnk-patients",
      feature: Feature.PRIMARYCARE,
    },
    {
      key: "/intervencoes",
      label: t("menu.interventions"),
      icon: <WarningOutlined />,
      id: "gtm-lnk-intervencoes",
    },
    {
      key: "/relatorios",
      label: t("menu.reports"),
      icon: <PieChartOutlined />,
      id: "gtm-lnk-report",
    },
    {
      key: "https://noharm.octadesk.com/kb",
      label: t("menu.knowledgeBase"),
      icon: <BulbOutlined />,
      id: "gtm-lnk-knowledgeBase",
    },
    {
      key: "https://noharm.octadesk.com/kb/article/novidades",
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
          key: "/admin/frequencias",
          label: t("menu.frequency"),
          icon: <HourglassOutlined />,
          id: "gtm-lnk-frequencias",
          role: ["admin"],
        },
        {
          key: "/admin/memoria",
          label: t("menu.memory"),
          icon: <SaveOutlined />,
          id: "gtm-lnk-memory",
          role: ["admin"],
        },
        {
          key: "/admin/motivo-intervencao",
          label: t("menu.interventionReasons"),
          icon: <WarningOutlined />,
          id: "gtm-lnk-intv-reason",
          role: ["admin"],
        },
        {
          key: "/medicamentos",
          label: t("menu.medications"),
          icon: <MedicineBoxOutlined />,
          id: "gtm-lnk-medicamentos",
        },
        {
          key: "/exames",
          label: t("menu.exams"),
          icon: <MedicineBoxOutlined />,
          id: "gtm-lnk-exames",
        },
        {
          key: "/configuracoes/usuario",
          label: t("menu.userConfig"),
          icon: <UserOutlined />,
          id: "gtm-lnk-usuario",
        },
        {
          key: "/configuracoes/administracao",
          label: t("menu.user-administration"),
          icon: <UsergroupAddOutlined />,
          id: "gtm-lnk-user-administration",
          role: ["userAdmin"],
        },
      ],
    },
  ];

  return (
    <Navigator
      mode="vertical"
      theme="dark"
      selectedKeys={[location.pathname]}
      items={items}
      onClick={linkTo}
    ></Navigator>
  );
}
