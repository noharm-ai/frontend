import React from "react";
import { isEmpty } from "lodash";
import {
  format,
  parseISO,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import { useSelector } from "react-redux";
import {
  WarningOutlined,
  MessageOutlined,
  HourglassOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import Permission from "models/Permission";

import { TableTags } from "../../index.style";

function PresmedTags({ prescription, bag }) {
  const drugForm = useSelector(
    (state) => state.drugFormStatus.list[prescription.idPrescriptionDrug]
  );

  let expiresIn = null;
  let expiresInMinutes = null;
  let prescribedTo = null;

  const hasExpireInfo = prescription.cpoe;
  if (hasExpireInfo && !prescription.suspended) {
    if (bag.headers[prescription.cpoe].expire) {
      const expirationDate = parseISO(bag.headers[prescription.cpoe].expire);
      const currentDate = new Date();
      expiresIn = differenceInHours(expirationDate, currentDate);
      expiresInMinutes = differenceInMinutes(expirationDate, currentDate);
    }

    if (bag.headers[prescription.cpoe].date) {
      const prescriptionDate = parseISO(bag.headers[prescription.cpoe].date);
      const currentDate = new Date();
      prescribedTo = differenceInHours(currentDate, prescriptionDate);
    }
  }

  return (
    <TableTags>
      <span
        className="tag gtm-tag-msg"
        onClick={() => bag.handleRowExpand(prescription)}
      >
        {prescription.recommendation &&
          prescription.recommendation !== "None" && (
            <Tooltip title={bag.t("prescriptionDrugTags.recommendation")}>
              <MessageOutlined style={{ fontSize: 18, color: "#108ee9" }} />
            </Tooltip>
          )}
      </span>
      <span
        className="tag gtm-tag-warn"
        onClick={() => bag.handleRowExpand(prescription)}
      >
        {!isEmpty(prescription.prevIntervention) && (
          <Tooltip title={bag.t("prescriptionDrugTags.prevIntervention")}>
            <WarningOutlined style={{ fontSize: 18, color: "#fa8c16" }} />
          </Tooltip>
        )}
        {isEmpty(prescription.prevIntervention) &&
          prescription.existIntervention && (
            <Tooltip
              title={bag.t("prescriptionDrugTags.prevInterventionSolved")}
            >
              <WarningOutlined style={{ fontSize: 18, color: "gray" }} />
            </Tooltip>
          )}
      </span>
      {hasExpireInfo && (
        <>
          <span
            className="tag gtm-tag-expires"
            onClick={() => bag.handleRowExpand(prescription)}
          >
            {(expiresIn < 0 || (expiresIn === 0 && expiresInMinutes < 0)) && (
              <Tooltip title={bag.t("prescriptionDrugTags.expired")}>
                <HourglassOutlined style={{ fontSize: 18, color: "#f5222d" }} />
              </Tooltip>
            )}
            {((expiresIn > 0 && expiresIn < 24) ||
              (expiresIn === 0 && expiresInMinutes > 0)) && (
              <Tooltip
                title={
                  expiresIn === 0
                    ? `${bag.t(
                        "prescriptionDrugTags.expiresIn"
                      )} ${expiresInMinutes}min`
                    : `${bag.t("prescriptionDrugTags.expiresIn")} ${expiresIn}h`
                }
              >
                <HourglassOutlined style={{ fontSize: 18, color: "#ff9f1c" }} />
              </Tooltip>
            )}
          </span>
          <span
            className="tag gtm-tag-prescribedTo"
            onClick={() => bag.handleRowExpand(prescription)}
          >
            {prescribedTo < 0 && (
              <Tooltip
                title={`Agendado para ${format(
                  new Date(bag.headers[prescription.cpoe].date),
                  "dd/MM/yyyy HH:mm"
                )}`}
              >
                <CalendarOutlined style={{ fontSize: 18, color: "#01579B" }} />
              </Tooltip>
            )}
          </span>
        </>
      )}
      {bag.featureService.hasPresmedForm() &&
        bag.permissionService.has(Permission.READ_DISPENSATION) &&
        bag.formTemplate && (
          <span
            className="tag gtm-tag-alert"
            onClick={() => bag.handleRowExpand(prescription)}
          >
            {!drugForm?.updated && (
              <Tooltip title="Dispensação pendente">
                <Tag
                  color="yellow"
                  style={{
                    marginLeft: "2px",
                    color: "#d46b08",
                    borderColor: "#ffd591",
                  }}
                >
                  D
                </Tag>
              </Tooltip>
            )}
          </span>
        )}
    </TableTags>
  );
}

export default PresmedTags;
