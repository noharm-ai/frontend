import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  LinkOutlined,
  CheckOutlined,
  WarningOutlined,
  RollbackOutlined,
  MoreOutlined,
  PlusOutlined,
  CopyOutlined,
} from "@ant-design/icons";

import Dropdown from "components/Dropdown";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import notification from "components/notification";
import { sourceToStoreType } from "utils/transformers/prescriptions";
import { getErrorMessageFromException } from "utils/errorHandler";
import { setCheckSummary } from "features/prescription/PrescriptionSlice";
import { PanelActionContainer } from "../PrescriptionDrug.style";

const PanelAction = ({
  id,
  aggId,
  header,
  source,
  groupData,
  checkScreening,
  isChecking,
  selectPrescriptionDrug,
  hasPrescriptionEdit,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const summarySourceToType = (s) => {
    switch (sourceToStoreType(s)) {
      case "prescription":
        return "drugs";

      case "solution":
        return "solutions";
      case "procedure":
        return "procedures";

      case "diet":
        return "diet";

      default:
        console.error("invalid source", s);
        return null;
    }
  };

  const infoIcon = (title) => {
    return (
      <Tooltip title={title}>
        <CheckOutlined
          style={{
            fontSize: 18,
            color: "#52c41a",
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            right: groupData ? "15px" : "60px",
          }}
        />
      </Tooltip>
    );
  };

  const summaryTags = (summary) => {
    const tags = [];

    if (summary.interventions) {
      tags.push(
        <Tooltip
          title={t("prescriptionDrugTags.intervention")}
          key="interventions"
        >
          <WarningOutlined
            style={{
              fontSize: 18,
              color: "#fa8c16",
              verticalAlign: "middle",
              marginRight: "7px",
            }}
          />
        </Tooltip>
      );
    }

    if (!tags.length) {
      return null;
    }

    return tags.map((t) => t);
  };

  const setPrescriptionStatus = (id, status) => {
    if (status === "s") {
      dispatch(
        setCheckSummary({
          idPrescription: id,
          agg: false,
        })
      );
    } else {
      checkScreening(id, status)
        .then(() => {
          notification.success({
            message:
              status === "s"
                ? "Checagem efetuada com sucesso!"
                : "Checagem desfeita com sucesso!",
          });
        })
        .catch((err) => {
          notification.error({
            message: t("error.title"),
            description: getErrorMessageFromException(err, t),
          });
        });
    }
  };

  const handleMenuClick = ({ key, domEvent }) => {
    switch (key) {
      case "more":
        window.open(`/prescricao/${id}`);
        break;

      case "check":
        setPrescriptionStatus(id, "s");
        break;

      case "undo":
        setPrescriptionStatus(id, "0");
        break;

      case "add":
        selectPrescriptionDrug({
          idPrescription: id,
          idSegment: header.idSegment,
          idHospital: header.idHospital,
          source,
          aggId,
          updateDrug: true,
        });
        break;

      case "copy":
        selectPrescriptionDrug({
          idPrescription: id,
          idSegment: header.idSegment,
          idHospital: header.idHospital,
          source,
          aggId,
          copyDrugs: true,
        });
        break;

      default:
        console.error("event not defined");
    }

    domEvent.stopPropagation();
  };

  const prescriptionOptions = (header) => {
    const items = [
      {
        key: "more",
        label: t("labels.openPrescription"),
        icon: <LinkOutlined />,
        id: "gtm-btn-more-open",
      },
      {
        type: "divider",
      },
    ];

    if (header.status !== "s") {
      items.push({
        key: "check",
        label: t("labels.checkPrescription"),
        icon: <CheckOutlined />,
        id: "gtm-btn-more-check",
      });
    }

    if (header.status === "s") {
      items.push({
        key: "undo",
        label: t("labels.undoCheckPrescription"),
        icon: <RollbackOutlined />,
        id: "gtm-btn-more-undo",
      });
    }

    if (hasPrescriptionEdit) {
      items.push({
        key: "add",
        label: t("screeningBody.btnAddDrug"),
        icon: <PlusOutlined />,
        id: "gtm-btn-more-add",
      });

      items.push({
        key: "copy",
        label: "Copiar medicamentos de prescrições anteriores",
        icon: <CopyOutlined />,
        id: "gtm-btn-more-copy",
      });
    }

    return {
      items,
      onClick: handleMenuClick,
    };
  };

  const openMenu = (e) => {
    e.stopPropagation();
  };

  if (groupData) {
    if (groupData.checked) {
      return infoIcon("Todas as prescrições desta vigência já foram checadas");
    }

    return summaryTags(groupData.summary);
  }

  return (
    <PanelActionContainer>
      <div className="info">
        {header.status !== "s" &&
          summaryTags(header[summarySourceToType(source)] || {})}
        {header.status === "s" &&
          header.user &&
          infoIcon(`${t("labels.checkedBy")}: ${header.user}`)}
        {header.status === "s" &&
          !header.user &&
          infoIcon(`${t("screeningHeader.btnChecked")}`)}
      </div>

      <div>
        <Dropdown menu={prescriptionOptions(header)} trigger={["click"]}>
          <Tooltip title="Opções">
            <Button
              type="link gtm-bt-check-single"
              onClick={openMenu}
              style={{ padding: 0 }}
              loading={isChecking}
            >
              {!isChecking && (
                <MoreOutlined style={{ marginLeft: 0, fontSize: "30px" }} />
              )}
            </Button>
          </Tooltip>
        </Dropdown>
      </div>
    </PanelActionContainer>
  );
};

export default PanelAction;
